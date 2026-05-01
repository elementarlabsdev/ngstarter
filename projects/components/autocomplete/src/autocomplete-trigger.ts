import {
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  ViewContainerRef,
  effect,
  Injector,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Autocomplete } from './autocomplete/autocomplete';
import { fromEvent, Subscription, merge } from 'rxjs';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { Option } from '@ngstarter/components/option';
import { FormField } from '@ngstarter/components/form-field';
import { ChipInput } from '@ngstarter/components/chips';

@Directive({
  selector: '[ngsAutocomplete]',
  exportAs: 'ngsAutocompleteTrigger',
  host: {
    'role': 'combobox',
    'aria-autocomplete': 'list',
    'aria-haspopup': 'listbox',
    '(input)': '_handleInput()',
    '(focusin)': '_handleFocus()',
    '(click)': '_handleClick()',
    '(keydown)': '_handleKeydown($event)',
  }
})
export class AutocompleteTrigger implements OnDestroy {
  private _elementRef = inject(ElementRef<HTMLInputElement>);
  private _overlay = inject(Overlay);
  private _viewContainerRef = inject(ViewContainerRef);
  private _formField = inject(FormField, { optional: true });
  private _chipInput = inject(ChipInput, { optional: true });
  private _injector = inject(Injector);

  autocomplete = input.required<Autocomplete>({alias: 'ngsAutocomplete'});

  private _overlayRef: OverlayRef | null = null;
  private _portal: TemplatePortal | null = null;
  private _closingSubscription = Subscription.EMPTY;
  private _keyManager!: ActiveDescendantKeyManager<Option>;
  private _canOpenOnInput = true;
  private _resizeObserver: ResizeObserver | null = null;
  private _optionsSubscription = Subscription.EMPTY;

  constructor() {
    effect(() => {
      const chipsLength = this._chipInput?.chipGrid?.chipsLength;

      if (chipsLength === 0 && this.panelOpen) {
        this._elementRef.nativeElement.focus();
      }
    });
  }

  ngOnDestroy() {
    this._destroyOverlay();
    this._stopResizeObserver();
    this._optionsSubscription.unsubscribe();
  }

  private _startResizeObserver() {
    this._resizeObserver = new ResizeObserver(() => {
      this.updatePosition();
    });
    this._resizeObserver.observe(this._getConnectedElement().nativeElement);
  }

  private _stopResizeObserver() {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  _handleInput(): void {
    if (!this.panelOpen && this._canOpenOnInput) {
      this.openPanel();
    }
    this._syncSelectedOption();
  }

  private _syncSelectedOption(): void {
    const value = this._elementRef.nativeElement.value;
    this.autocomplete().options().forEach(option => {
      if (value && option.viewValue.toLowerCase() === value.toLowerCase()) {
        option.select();
      } else {
        option.deselect();
      }
    });
  }

  _handleFocus(): void {
    if (!this.panelOpen && this._canOpenOnInput) {
      this.openPanel();
    }
    this._syncSelectedOption();
  }

  _handleClick(): void {
    if (!this.panelOpen && this._canOpenOnInput) {
      this.openPanel();
    }
    this._syncSelectedOption();
  }

  _handleKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented) {
      return;
    }

    if (event.key === 'Escape' && this.panelOpen) {
      this.closePanel();
      event.stopPropagation();
    } else if (this._keyManager) {
      const activeItemBefore = this._keyManager.activeItem;
      this._keyManager.onKeydown(event);

      if (event.key === 'Enter' && this._keyManager.activeItem && this._keyManager.activeItem === activeItemBefore) {
        this._selectOption(this._keyManager.activeItem);
        event.preventDefault();
      }
    }
  }

  get panelOpen(): boolean {
    return !!this._overlayRef && this._overlayRef.hasAttached();
  }

  openPanel(): void {
    if (this.panelOpen || !this.autocomplete().options().length) {
      return;
    }

    if (!this._overlayRef) {
      this._createOverlay();
    }

    this._updatePanelWidth();

    if (!this._overlayRef!.hasAttached()) {
      this._portal = new TemplatePortal(this.autocomplete().template(), this._viewContainerRef);
      this._overlayRef!.attach(this._portal);
      this._closingSubscription = this._subscribeToClosingIndices();
      this._setupSelectionListeners();
      this._startResizeObserver();
      this.autocomplete().opened.emit();
    }

    this._initKeyManager();
    this._setActiveItem();
  }

  private _setActiveItem(): void {
    const value = this._elementRef.nativeElement.value;

    if (this.autocomplete().options().length > 0) {
      const activeOption = this.autocomplete().options().find(option => {
        return option.viewValue.toLowerCase() === value.toLowerCase();
      });

      if (activeOption) {
        this._keyManager.setActiveItem(activeOption);
      } else {
        if (value && this.autocomplete().autoActiveFirstOption()) {
          this._keyManager.setFirstItemActive();
        } else {
          this._keyManager.setActiveItem(-1);
        }
      }

      this._scrollToOption();
    }
  }

  private _scrollToOption(): void {
    const index = this._keyManager.activeItemIndex || 0;
    const option = this.autocomplete().options()[index];

    if (option && this.autocomplete().panel()) {
      const panel = this.autocomplete().panel()!.nativeElement;
      const optionElement = option.elementRef.nativeElement;
      const panelTop = panel.scrollTop;
      const panelBottom = panelTop + panel.clientHeight;
      const optionTop = optionElement.offsetTop;
      const optionBottom = optionTop + optionElement.clientHeight;

      if (optionTop < panelTop) {
        panel.scrollTop = optionTop;
      } else if (optionBottom > panelBottom) {
        panel.scrollTop = optionBottom - panel.clientHeight;
      }
    }
  }

  closePanel(): void {
    if (this.panelOpen) {
      this._overlayRef!.detach();
      this._closingSubscription.unsubscribe();
      this._stopResizeObserver();

      if (this.autocomplete().requireSelection() && !this._elementRef.nativeElement.value) {
        this._elementRef.nativeElement.value = '';
        this._elementRef.nativeElement.dispatchEvent(new Event('input', { bubbles: true }));
      }

      this.autocomplete().closed.emit();
    }
  }

  updatePosition(): void {
    if (this._overlayRef) {
      this._updatePanelWidth();
      this._overlayRef.updatePosition();
    }
  }

  private _getConnectedElement(): ElementRef {
    if (this._formField) {
      return this._formField.wrapper();
    }

    return this._elementRef;
  }

  private _getPanelWidth(): number | string {
    return this.autocomplete().panelWidth() || this._getConnectedElement().nativeElement.offsetWidth;
  }

  private _createOverlay(): void {
    const strategy = this._overlay
      .position()
      .flexibleConnectedTo(this._getConnectedElement())
      .withPositions([
        {originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top'},
        {originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom'}
      ]);

    this._overlayRef = this._overlay.create({
      positionStrategy: strategy,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
      width: this._getPanelWidth(),
    });
  }

  private _destroyOverlay(): void {
    if (this._overlayRef) {
      this.closePanel();
      this._overlayRef.dispose();
      this._overlayRef = null;
    }
  }

  private _subscribeToClosingIndices(): Subscription {
    const backdropClick = this._overlayRef!.backdropClick();
    const detachments = this._overlayRef!.detachments();
    const outsidePointerEvents = this._overlayRef!.outsidePointerEvents();

    return merge(backdropClick, detachments, outsidePointerEvents).subscribe((event) => {
      if (event instanceof MouseEvent) {
        if (this._elementRef.nativeElement.contains(event.target as Node)) {
          return;
        }

        const connectedElement = this._getConnectedElement().nativeElement;

        if (connectedElement.contains(event.target as Node)) {
          return;
        }
      }

      this.closePanel();
    });
  }

  private _initKeyManager(): void {
    if (this._keyManager) {
      return;
    }

    this._keyManager = new ActiveDescendantKeyManager<Option>(this.autocomplete().options())
      .withWrap()
      .withTypeAhead();

    this._optionsSubscription = toObservable(this.autocomplete().options, { injector: this._injector }).subscribe(() => {
      this._setupSelectionListeners();
      this._setActiveItem();
      this._syncSelectedOption();

      if (this.autocomplete().options().length === 0 && this.panelOpen) {
        this.closePanel();
      } else if (this.autocomplete().options().length > 0 && !this.panelOpen && this._elementRef.nativeElement === document.activeElement && this._canOpenOnInput) {
        this.openPanel();
      }
    });

    this._keyManager.change.subscribe(() => {
      this._scrollToOption();

      if (this.autocomplete().autoSelectActiveOption() && this._keyManager.activeItem) {
        this._selectOption(this._keyManager.activeItem);
      }

      this.autocomplete().optionActivated.emit({
        source: this.autocomplete(),
        option: this._keyManager.activeItem
      });
    });
  }

  private _setupSelectionListeners(): void {
    this.autocomplete().options().forEach(option => {
      // Prevent input from losing focus on mousedown, but do not select yet
      const mousedownSub = fromEvent<MouseEvent>(option.elementRef.nativeElement, 'mousedown').subscribe((event) => {
        event.preventDefault();
      });
      // Select option on click (after mouseup) to match native/select behavior
      const clickSub = fromEvent<MouseEvent>(option.elementRef.nativeElement, 'click').subscribe((event) => {
        if (option.disabled) {
          event.preventDefault();
          return;
        }
        this._selectOption(option);
      });
      if (this._closingSubscription && !this._closingSubscription.closed) {
        this._closingSubscription.add(mousedownSub);
        this._closingSubscription.add(clickSub);
      }
    });
  }

  private _updatePanelWidth(): void {
    if (this._overlayRef) {
      this._overlayRef.updateSize({
        width: this._getPanelWidth()
      });
    }
  }

  private _selectOption(option: Option): void {
    const value = option.viewValue;
    this.autocomplete().options().forEach(o => o.deselect());
    option.select();
    this._canOpenOnInput = false;
    this._elementRef.nativeElement.value = value;
    this._elementRef.nativeElement.dispatchEvent(new Event('input', { bubbles: true }));
    this._elementRef.nativeElement.dispatchEvent(new Event('change', { bubbles: true }));
    this.autocomplete()._emitSelectEvent(option);
    this.closePanel();
    setTimeout(() => this._canOpenOnInput = true);
  }
}
