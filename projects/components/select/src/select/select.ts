import {
  Component,
  ElementRef,
  booleanAttribute,
  inject,
  forwardRef,
  OnDestroy,
  AfterContentInit,
  ChangeDetectorRef,
  input,
  output,
  model,
  viewChild,
  contentChildren,
  effect,
  computed,
  signal,
  DoCheck,
  DestroyRef,
  untracked
} from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { SelectTrigger } from '../select-trigger/select-trigger';
import { FilterTrigger } from '../filter-trigger/filter-trigger';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkConnectedOverlay, OverlayModule, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { SelectBody } from '../select-body/select-body';
import { NgTemplateOutlet } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { Optgroup, _Option, OPTION, OPTION_PARENT, _OptionParent } from '@ngstarter-ui/components/option';
import { FormFieldControl, FORM_FIELD } from '@ngstarter-ui/components/form-field';
import { _Select, SELECT } from './select-token';
import { AUTOFOCUSABLE } from '@ngstarter-ui/components/core';

export class SelectChange {
  constructor(public source: Select, public value: any) { }
}

@Component({
  selector: 'ngs-select',
  exportAs: 'ngsSelect',
  standalone: true,
  imports: [
    OverlayModule,
    CdkOverlayOrigin
],
  templateUrl: './select.html',
  styleUrl: './select.scss',
  providers: [
    {
      provide: FormFieldControl,
      useExisting: forwardRef(() => Select)
    },
    {
      provide: SELECT,
      useExisting: forwardRef(() => Select)
    },
    {
      provide: OPTION_PARENT,
      useExisting: forwardRef(() => Select)
    },
    {
      provide: AUTOFOCUSABLE,
      useExisting: forwardRef(() => Select)
    }
  ],
  host: {
    'role': 'combobox',
    'aria-autocomplete': 'none',
    'aria-haspopup': 'listbox',
    '[attr.id]': 'id',
    '[attr.tabindex]': 'disabled ? -1 : tabIndex()',
    '[attr.aria-controls]': 'panelOpen() ? id + "-panel" : null',
    '[attr.aria-expanded]': 'panelOpen()',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-required]': 'required',
    '[attr.aria-disabled]': 'disabled',
    '[attr.aria-invalid]': 'errorState',
    '[class.ngs-select-disabled]': 'disabled',
    '[class.ngs-select-invalid]': 'errorState',
    '[class.ngs-select-required]': 'required',
    '[class.ngs-select-empty]': 'empty',
    '[class.ngs-select-panel-open]': 'panelOpen()',
    '[class.ngs-select-has-filter-trigger]': 'filterTrigger().length > 0',
    '(click)': 'toggle()',
    '(keydown)': '_handleKeydown($event)',
    '(focus)': '_onFocus()',
    '(blur)': '_onBlur()',
  }
})
export class Select implements ControlValueAccessor, OnDestroy, AfterContentInit, DoCheck, FormFieldControl<any>, _Select, _OptionParent {
  private _elementRef = inject(ElementRef);
  private _cdr = inject(ChangeDetectorRef);
  private _destroy = new Subject<void>();
  private _formField = inject(FORM_FIELD, { optional: true });
  readonly ngControl = inject(NgControl, { optional: true, self: true });

  readonly stateChanges = signal<void>(undefined);
  private _focused = signal(false);
  protected readonly selectBody = contentChildren(SelectBody);
  get focused(): boolean { return this._focused(); }

  _id = input(`ngs-select-${Math.random().toString(36).substr(2, 9)}`, { alias: 'id' });
  get id(): string { return this._id(); }
  _placeholder = input<string | undefined>(undefined, { alias: 'placeholder' });
  get placeholder(): string | undefined { return this._placeholder(); }
  private _disabled = signal(false);
  _disabledInput = input<boolean, any>(false, {
    transform: (value: boolean | string | null) => booleanAttribute(value),
    alias: 'disabled'
  });
  _required = input(false, { transform: booleanAttribute, alias: 'required' });
  get required(): boolean { return this._required(); }
  multiple = input(false, { transform: booleanAttribute });
  hideCheckIcon = input(false, { transform: booleanAttribute });
  ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  tabIndex = input<number, any>(0, {
    transform: (value: number | string | null) => value == null ? 0 : parseInt(value + '', 10)
  });
  ariaDescribedby = input<string | null>(null, { alias: 'aria-describedby' });

  isDisabled = computed(() => this._disabledInput() || this._disabled());
  get disabled(): boolean { return this.isDisabled(); }

  readonly selectionChange = output<any>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  options = contentChildren<_Option>(OPTION, { descendants: true });
  optionGroups = contentChildren(Optgroup, { descendants: true });
  customTrigger = contentChildren(SelectTrigger, { descendants: true });
  filterTrigger = contentChildren(FilterTrigger, { descendants: true });
  overlayDir = viewChild(CdkConnectedOverlay);
  panel = viewChild<ElementRef<HTMLElement>>('panel');
  origin = viewChild<CdkOverlayOrigin>('origin');

  get overlayOrigin(): CdkOverlayOrigin | ElementRef {
    if (this._formField) {
      return this._formField.wrapper() || this._formField.elementRef;
    }

    return this.origin() || this._elementRef;
  }

  get overlayWidth(): string | number {
    if (this._formField) {
      const element = this._formField.wrapper().nativeElement || this._formField.elementRef.nativeElement;
      return element.getBoundingClientRect?.().width || 'auto';
    }

    return 'auto';
  }

  panelOpen = signal(false);
  _panelPosition = signal<'top' | 'bottom'>('bottom');
  private _selectionModel: SelectionModel<_Option>;
  private _selectionChanges = signal<number>(0);
  value = model<any>();
  private _optionsDestroy = new Subject<void>();
  private _selectionModelDestroy = new Subject<void>();

  _optionsContentChanges = signal<number>(0);
  private _errorState = signal(false);
  get errorState(): boolean { return this._errorState(); }

  private _empty = computed(() => {
    this._selectionChanges();
    const value = this.value();
    const isValueEmpty = value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
    const isEmpty = (this._selectionModel?.isEmpty() ?? true) && isValueEmpty;
    return isEmpty;
  });
  get empty(): boolean { return this._empty(); }

  private _shouldLabelFloat = computed(() => {
    return this.panelOpen() || !this.empty || this.focused;
  });
  get shouldLabelFloat(): boolean { return this._shouldLabelFloat(); }

  _onChange: (value: any) => void = () => {};
  _onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this._selectionModel = new SelectionModel<_Option>(this.multiple());
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      this._selectionModelDestroy.next();
      this._selectionModelDestroy.complete();
    });

    effect(() => {
      const isMultiple = this.multiple();
      const value = this.value();
      untracked(() => {
        this._selectionModelDestroy.next();
        this._selectionModel = new SelectionModel<_Option>(isMultiple);
        this._selectionModel.changed.pipe(takeUntil(this._selectionModelDestroy)).subscribe(event => {
          event.added.forEach(option => option.select());
          event.removed.forEach(option => option.deselect());
          this._selectionChanges.update(v => v + 1);
          this.stateChanges.set(undefined);
        });
        this._selectionChanges.update(v => v + 1);
        this._setSelectionByValue(value);
      });
    });

    effect(() => {
      this.options();
      this._optionsContentChanges();
      const value = this.value();
      untracked(() => {
        this._resetOptions();
        this._setSelectionByValue(value);

        if (this.panelOpen()) {
          setTimeout(() => {
            this._scrollToSelectedOption();
          }, 10);
        }
      });
    });

    effect(() => {
      this._optionsContentChanges();
      untracked(() => {
        this._selectionChanges.update(v => v + 1);
      });
    });
  }


  get selected(): _Option | _Option[] {
    return this.multiple() ? this._selectionModel.selected : this._selectionModel.selected[0];
  }

  triggerValue = computed(() => {
    this._selectionChanges();
    this.options();
    this._optionsContentChanges();

    if (this.empty) {
      return '';
    }

    if (this.multiple()) {
      return this._selectionModel.selected.map(option => option.viewValue).join(', ');
    }

    return this._selectionModel.selected[0]?.viewValue || '';
  });

  selectedCount = computed(() => {
    this._selectionChanges();
    const selectedLength = this._selectionModel?.selected.length ?? 0;

    if (selectedLength > 0) {
      return selectedLength;
    }

    const value = this.value();

    if (Array.isArray(value)) {
      return value.filter(v => v !== null && v !== undefined && v !== '').length;
    }

    return value === null || value === undefined || value === '' ? 0 : 1;
  });

  selectedData = computed(() => {
    this._selectionChanges();

    if (this.multiple()) {
      return this._selectionModel.selected.map(option => this._getOptionData(option));
    }

    const selectedOption = this._selectionModel.selected[0];

    return selectedOption ? this._getOptionData(selectedOption) : null;
  });

  ngAfterContentInit() {
  }

  private _resetOptions(): void {
    this._optionsDestroy.next();
    const options = this.options();

    if (options.length === 0) {
      return;
    }

    options.forEach(option => {
      outputToObservable(option.onSelectionChange).pipe(takeUntil(this._optionsDestroy)).subscribe(opt => {
        this._onOptionClick(opt);
      });
    });
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
    this._optionsDestroy.next();
    this._optionsDestroy.complete();
  }

  ngDoCheck() {
    this.updateErrorState();
  }

  private updateErrorState() {
    const oldState = this.errorState;
    const newState = !!(this.ngControl?.invalid && (this.ngControl?.touched || this.ngControl?.dirty));

    if (newState !== oldState) {
      this._errorState.set(newState);
    }
  }

  toggle(): void {
    if (this.disabled) {
      return;
    }
    this.panelOpen() ? this.close() : this.open();
  }

  open(): void {
    if (this.disabled || this.panelOpen()) {
      return;
    }
    this.panelOpen.set(true);
    this._focused.set(true);
    this.stateChanges.set(undefined);
    this.opened.emit();

    setTimeout(() => {
      this._scrollToSelectedOption();
    }, 10);
  }

  close(): void {
    if (this.panelOpen()) {
      this.panelOpen.set(false);
      this._panelPosition.set('bottom');
      this._focused.set(false);
      this.stateChanges.set(undefined);
      this.closed.emit();
      this._onTouched();
    }
  }

  _onPositionChange(event: any) {
    this._panelPosition.set(event.connectionPair.originY === 'top' ? 'top' : 'bottom');
    this._cdr.detectChanges();
  }

  _onFocus() {
    if (!this.disabled) {
      this._focused.set(true);
      this.stateChanges.set(undefined);
    }
  }

  _onBlur() {
    if (!this.panelOpen()) {
      this._focused.set(false);
      this._onTouched();
      this.stateChanges.set(undefined);
    }
  }

  writeValue(value: any): void {
    this.value.set(value);
    if (this.options()) {
      this._setSelectionByValue(value);
    }
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
    this._cdr.markForCheck();
  }

  focus(): void {
    this._elementRef.nativeElement.focus();
    this.open();
  }

  _handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.toggle();
      event.preventDefault();
    }
  }

  _onOptionClick(option: _Option): void {
    if (option.value() == null || option.value() === '') {
      this._selectionModel.clear();
      this._propagateChanges();
    } else {
      this._selectOption(option);
    }

    if (!this.multiple()) {
      this.close();
    }
  }

  private _selectOption(option: _Option): void {
    const wasSelected = this._selectionModel.isSelected(option);

    if (this.multiple()) {
      this._selectionModel.toggle(option);
    } else {
      this._selectionModel.select(option);
    }

    if (wasSelected !== this._selectionModel.isSelected(option)) {
      this._propagateChanges();
    }
  }

  private _propagateChanges(): void {
    let valueToEmit: any;

    if (this.multiple()) {
      valueToEmit = this._selectionModel.selected.map(option => option.value());
    } else {
      valueToEmit = this._selectionModel.selected[0]?.value();
    }

    if (valueToEmit === undefined) {
      valueToEmit = null;
    }

    this.value.set(valueToEmit);
    this._onChange(valueToEmit);
    this.selectionChange.emit(new SelectChange(this, valueToEmit));
    this._cdr.markForCheck();
  }

  private _setSelectionByValue(value: any): void {
    this._selectionModel.clear();

    if (this.multiple() && Array.isArray(value)) {
      value.forEach(v => this._selectValue(v));
    } else {
      this._selectValue(value);
    }

    this._cdr.markForCheck();
  }

  private _scrollToSelectedOption(): void {
    const selected = this._selectionModel.selected[0];

    if (!selected) {
      return;
    }

    const panel = this.panel()?.nativeElement;

    if (!panel) {
      return;
    }

    let scrollContainer: HTMLElement = panel;
    const selectBody = this.selectBody()[0];

    if (selectBody) {
      scrollContainer = selectBody._elementRef.nativeElement;
    } else {
      const content = panel.querySelector('.ngs-select-content') as HTMLElement;

      if (content) {
        scrollContainer = content;
      }
    }

    const option = selected.elementRef.nativeElement;
    let offsetTop = 0;
    let currentElement = option;

    while (currentElement && currentElement !== scrollContainer && scrollContainer.contains(currentElement)) {
      offsetTop += currentElement.offsetTop;
      currentElement = currentElement.offsetParent as HTMLElement;
    }

    const optionHeight = option.offsetHeight;
    const containerScrollTop = scrollContainer.scrollTop;
    const containerHeight = scrollContainer.clientHeight;

    if (offsetTop < containerScrollTop) {
      scrollContainer.scrollTop = offsetTop;
    } else if (offsetTop + optionHeight > containerScrollTop + containerHeight) {
      scrollContainer.scrollTop = offsetTop - containerHeight + optionHeight;
    }

    // Дополнительная проверка: если скролл все еще не там, попробуем через getBoundingClientRect
    // но только как fallback, так как offsetTop надежнее если offsetParent настроены верно.
    const containerRect = scrollContainer.getBoundingClientRect();
    const optionRect = option.getBoundingClientRect();

    if (optionRect.top < containerRect.top || optionRect.bottom > containerRect.bottom) {
      const relativeOffsetTop = optionRect.top - containerRect.top + scrollContainer.scrollTop;
      if (relativeOffsetTop < scrollContainer.scrollTop) {
        scrollContainer.scrollTop = relativeOffsetTop;
      } else if (relativeOffsetTop + optionHeight > scrollContainer.scrollTop + containerHeight) {
        scrollContainer.scrollTop = relativeOffsetTop - containerHeight + optionHeight;
      }
    }
  }

  private _getOptionIndex(option: _Option): number {
    return this.options().indexOf(option);
  }

  private _getOptionData(option: _Option): any {
    const data = option.data?.();

    return data === undefined ? option.value() : data;
  }

  private _selectValue(value: any): void {
    if (value == null) {
      return;
    }

    const correspondingOption = this.options().find(option => {
      try {
        return option.value() != null && option.value() === value;
      } catch {
        return false;
      }
    });

    if (correspondingOption) {
      this._selectionModel.select(correspondingOption);
    }
  }
}
