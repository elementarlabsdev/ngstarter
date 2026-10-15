import {
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  ViewContainerRef,
  effect,
  Injector,
  computed,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Autocomplete } from './autocomplete/autocomplete';
import { fromEvent, Subscription, merge } from 'rxjs';
import {
  createDropdownActiveDescendantKeyManager, isDropdownItemHidden, scrollDropdownItemIntoView
} from '@ngstarter-ui/components/core';
import { Option } from '@ngstarter-ui/components/option';
import { FormField } from '@ngstarter-ui/components/form-field';
import { ChipInput } from '@ngstarter-ui/components/chips';

@Directive({
  selector: '[ngsAutocomplete]',
  exportAs: 'ngsAutocompleteTrigger',
  host: {
    'role': 'combobox',
    'aria-autocomplete': 'list',
    'aria-haspopup': 'listbox',
    '[attr.aria-expanded]': 'panelOpen',
    '[attr.aria-controls]': 'panelOpen ? autocomplete().id : null',
    '[attr.aria-activedescendant]': 'panelOpen ? activeOptionId() : null',
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
  private readonly _options = computed(() => this.autocomplete().options());
  private readonly _keyManager = createDropdownActiveDescendantKeyManager(this._options, this._injector, {
    typeahead: false,
    homeAndEnd: false,
    skip: option => option.disabled || isDropdownItemHidden(option.elementRef.nativeElement),
  });
  protected readonly activeOptionId = computed(() => this._keyManager.activeItem?.id ?? null);
  private readonly _panelOpen = signal(false);
  private _selectionSubscription = Subscription.EMPTY;
  private _navigationSubscription = Subscription.EMPTY;
  private _canOpenOnInput = true;
  private _resizeObserver: ResizeObserver | null = null;
  private _optionsSubscription = Subscription.EMPTY;

  constructor() {
    this._initKeyManager();
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
    this._selectionSubscription.unsubscribe();
    this._navigationSubscription.unsubscribe();
    this._keyManager.destroy();
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
    if (event.defaultPrevented || event.isComposing || this._elementRef.nativeElement.disabled) {
      return;
    }

    if (event.key === 'Escape' && this.panelOpen) {
      this.closePanel();
      event.preventDefault();
      event.stopPropagation();
    } else if (event.key === 'Tab') {
      this.closePanel();
    } else if (event.key === 'Enter' && this.panelOpen) {
      const active = this._keyManager.activeItem;
      if (active && !active.disabled && this._options().includes(active) &&
          !isDropdownItemHidden(active.elementRef.nativeElement)) {
        this._selectOption(active);
        event.preventDefault();
      }
    } else if (!event.altKey && !event.ctrlKey && !event.metaKey &&
               (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      if (!this.panelOpen) {
        this.openPanel();
      }
      if (this.panelOpen) {
        this._keyManager.onKeydown(event);
      }
    }
  }

  get panelOpen(): boolean {
    return this._panelOpen();
  }

  openPanel(): void {
    if (this.panelOpen || this._elementRef.nativeElement.disabled || !this.autocomplete().options().length) {
      return;
    }

    if (!this._overlayRef) {
      this._createOverlay();
    }

    this._updatePanelWidth();

    if (!this._overlayRef!.hasAttached()) {
      this._portal = new TemplatePortal(this.autocomplete().template(), this._viewContainerRef);
      this._overlayRef!.attach(this._portal);
      this._panelOpen.set(true);
      this._closingSubscription = this._subscribeToClosingIndices();
      this._setupSelectionListeners();
      this._startResizeObserver();
      this.autocomplete().opened.emit();
    }

    this._setActiveItem();
  }

  private _setActiveItem(): void {
    const value = this._elementRef.nativeElement.value;

    if (this.autocomplete().options().length > 0) {
      const activeOption = this.autocomplete().options().find(option => {
        return !option.disabled && !isDropdownItemHidden(option.elementRef.nativeElement) &&
          option.viewValue.toLowerCase() === value.toLowerCase();
      });

      if (activeOption) {
        this._keyManager.setActiveItem(activeOption);
      } else {
        if (this.autocomplete().autoActiveFirstOption()) {
          this._keyManager.setFirstItemActive();
        } else {
          this._keyManager.setActiveItem(-1);
        }
      }

      this._scrollToOption();
    }
  }

  private _scrollToOption(): void {
    const option = this._keyManager.activeItem;
    if (option && this.autocomplete().panel()) {
      scrollDropdownItemIntoView(option.elementRef.nativeElement, this.autocomplete().panel()!.nativeElement);
    }
  }

  closePanel(): void {
    if (this.panelOpen) {
      this._panelOpen.set(false);
      this._overlayRef!.detach();
      this._closingSubscription.unsubscribe();
      this._selectionSubscription.unsubscribe();
      this._keyManager.setActiveItem(-1);
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
    this._optionsSubscription = toObservable(this._options, { injector: this._injector }).subscribe(() => {
      if (this.panelOpen) {
        this._setupSelectionListeners();
        const active = this._keyManager.activeItem;
        if (!active || !this._options().includes(active) || active.disabled) {
          this._setActiveItem();
        }
      }
      this._syncSelectedOption();

      if (this.autocomplete().options().length === 0 && this.panelOpen) {
        this.closePanel();
      } else if (this.autocomplete().options().length > 0 && !this.panelOpen && this._elementRef.nativeElement === document.activeElement && this._canOpenOnInput) {
        this.openPanel();
      }
    });

    this._navigationSubscription = this._keyManager.change.subscribe(() => {
      this._scrollToOption();

      if (this.panelOpen && this.autocomplete().autoSelectActiveOption() && this._keyManager.activeItem) {
        this._selectOption(this._keyManager.activeItem);
      }

      this.autocomplete().optionActivated.emit({
        source: this.autocomplete(),
        option: this._keyManager.activeItem
      });
    });
  }

  private _setupSelectionListeners(): void {
    this._selectionSubscription.unsubscribe();
    this._selectionSubscription = new Subscription();
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
      this._selectionSubscription.add(mousedownSub);
      this._selectionSubscription.add(clickSub);
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
