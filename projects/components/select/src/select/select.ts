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
  contentChild,
  contentChildren,
  effect,
  computed,
  signal,
  DoCheck,
  DestroyRef,
  untracked,
  viewChildren,
  numberAttribute
} from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { SelectTrigger } from '../select-trigger/select-trigger';
import { FilterTrigger } from '../filter-trigger/filter-trigger';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkConnectedOverlay, OverlayModule, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { SelectBody } from '../select-body/select-body';
import { SelectHeader } from '../select-header/select-header';
import { NgTemplateOutlet } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { Optgroup, Option, _Option, OPTION, OPTION_PARENT, _OptionParent } from '@ngstarter-ui/components/option';
import { FormFieldControl, FORM_FIELD } from '@ngstarter-ui/components/form-field';
import { _Select, SELECT } from './select-token';
import { AUTOFOCUSABLE } from '@ngstarter-ui/components/core';
import { SelectDataSource, SelectDataSourceOption, SelectDataSourceResult } from './select-data-source';
import { SelectOptionContentContext, SelectOptionContentDef } from './select-option-content-def.directive';
import { SelectValueContext, SelectValueDef } from './select-value-def.directive';

export class SelectChange {
  constructor(public source: Select, public value: any) { }
}

@Component({
  selector: 'ngs-select',
  exportAs: 'ngsSelect',
  imports: [
    OverlayModule,
    CdkOverlayOrigin,
    Option,
    SelectHeader,
    NgTemplateOutlet
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
    '[class.ngs-select-clearable]': 'clearable()',
    '[class.ngs-select-has-clear]': 'showClearButton()',
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
  clearable = input(false, { transform: booleanAttribute });
  dataSource = input<SelectDataSource | null | undefined>(null);
  pageSize = input(25, { transform: numberAttribute });
  searchable = input(false, { transform: booleanAttribute });
  searchDebounce = input(250, { transform: numberAttribute });
  minSearchLength = input(0, { transform: numberAttribute });
  loadOnOpen = input(true, { transform: booleanAttribute });
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

  private projectedOptions = contentChildren<_Option>(OPTION, { descendants: true });
  private dataSourceOptions = viewChildren<_Option>(OPTION);
  options = computed<_Option[]>(() => [
    ...this.projectedOptions(),
    ...this.dataSourceOptions()
  ]);
  optionGroups = contentChildren(Optgroup, { descendants: true });
  customTrigger = contentChildren(SelectTrigger, { descendants: true });
  filterTrigger = contentChildren(FilterTrigger, { descendants: true });
  optionContentDef = contentChild(SelectOptionContentDef, { descendants: true });
  selectValueDef = contentChild(SelectValueDef, { descendants: true });
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
  protected readonly asyncOptions = signal<SelectDataSourceOption[]>([]);
  protected readonly asyncSearch = signal('');
  protected readonly asyncLoading = signal(false);
  protected readonly asyncLoadingMore = signal(false);
  protected readonly asyncError = signal<unknown | null>(null);
  protected readonly asyncHasMore = signal(false);
  protected readonly asyncEnabled = computed(() => !!this.dataSource());
  private readonly _asyncSelectedCache = signal<SelectDataSourceOption[]>([]);
  private _asyncPage = 0;
  private _asyncCursor: unknown;
  private _asyncSearchTimer: ReturnType<typeof setTimeout> | null = null;
  private _asyncRequestId = 0;
  private _asyncAbortController: AbortController | null = null;
  private _lastDataSource: SelectDataSource | null | undefined = undefined;
  private _lastInitialSelectedKey = '';
  private _destroyed = false;

  private _empty = computed(() => {
    this._selectionChanges();
    this._asyncSelectedCache();
    this.asyncOptions();

    const value = this.value();
    const isValueEmpty = value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);

    if (isValueEmpty) {
      return true;
    }

    if (this.asyncEnabled()) {
      return this._selectedValues(value).every(selectedValue => !this._asyncOptionForValue(selectedValue));
    }

    const isEmpty = (this._selectionModel?.isEmpty() ?? true) && isValueEmpty;
    return isEmpty;
  });
  get empty(): boolean { return this._empty(); }
  readonly hasValue = computed(() => !this._empty());
  protected readonly showClearButton = computed(() => this.clearable() && this.hasValue() && !this.disabled);

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
      const dataSource = this.dataSource();

      untracked(() => {
        if (dataSource !== this._lastDataSource) {
          this._lastDataSource = dataSource;
          this._resetAsyncState();
        }

        if (!dataSource) {
          return;
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
    this._asyncSelectedCache();
    this.asyncOptions();

    if (this.empty) {
      return '';
    }

    if (this.multiple()) {
      const values = this._selectedValues(this.value());
      return values
        .map(value => this._viewValueForValue(value))
        .filter(value => value.length > 0)
        .join(', ');
    }

    return this._selectionModel.selected[0]?.viewValue || this._viewValueForValue(this.value()) || '';
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
    this._asyncSelectedCache();
    this.asyncOptions();

    if (this.asyncEnabled()) {
      if (this.multiple()) {
        return this._selectedValues(this.value()).map(value => this._dataForValue(value));
      }

      const value = this.value();

      return value === null || value === undefined || value === '' ? null : this._dataForValue(value);
    }

    if (this.multiple()) {
      return this._selectionModel.selected.map(option => this._getOptionData(option));
    }

    const selectedOption = this._selectionModel.selected[0];

    return selectedOption ? this._getOptionData(selectedOption) : null;
  });

  protected readonly selectValueContext = computed<SelectValueContext>(() => {
    this._selectionChanges();
    this._asyncSelectedCache();
    this.asyncOptions();

    const values = this._selectedValues(this.value());
    const labels = values.map(value => this._viewValueForValue(value)).filter(label => label.length > 0);
    const options = values
      .map(value => this._displayOptionForValue(value))
      .filter((option): option is SelectDataSourceOption => !!option);

    if (this.multiple()) {
      const data = values.map(value => this._dataForValue(value));

      return {
        $implicit: data,
        data,
        option: options,
        value: values,
        label: labels.join(', '),
        labels,
        count: values.length,
        multiple: true
      };
    }

    const value = values[0] ?? null;
    const data = value === null ? null : this._dataForValue(value);

    return {
      $implicit: data,
      data,
      option: options[0] ?? null,
      value,
      label: labels[0] ?? '',
      labels,
      count: values.length,
      multiple: false
    };
  });

  protected readonly selectValueTemplateReady = computed(() => {
    this._selectionChanges();
    this._asyncSelectedCache();
    this.asyncOptions();

    if (!this.asyncEnabled()) {
      return true;
    }

    const values = this._selectedValues(this.value());

    return values.length > 0 && values.every(value => !!this._asyncOptionForValue(value));
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
    this._destroyed = true;
    this._asyncAbortController?.abort();
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

    if (this.dataSource() && this.loadOnOpen() && !this.asyncLoading()) {
      const selectedValues = this._selectedValues(this.value());
      const selectedKey = this._selectedValuesKey(selectedValues);
      const initialKey = `${this.pageSize()}:${selectedKey}`;
      const missingSelectedOption = selectedValues.some(value => !this._asyncOptionForValue(value));
      const shouldLoadOptions = this.asyncOptions().length === 0 || missingSelectedOption;

      if (shouldLoadOptions) {
        const reason = selectedValues.length > 0 && missingSelectedOption && initialKey !== this._lastInitialSelectedKey
          ? 'initial'
          : 'open';

        if (reason === 'initial') {
          this._lastInitialSelectedKey = initialKey;
        }

        void this._loadFirstPage(reason);
      }
    }

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

  clear(event?: MouseEvent): void {
    event?.preventDefault();
    event?.stopPropagation();

    if (this.disabled || this.empty) {
      return;
    }

    this._selectionModel.clear();
    this._propagateChanges();
    this.stateChanges.set(undefined);
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

  protected onAsyncSearchInput(value: string): void {
    this.asyncSearch.set(value);

    if (this._asyncSearchTimer) {
      clearTimeout(this._asyncSearchTimer);
    }

    this._asyncSearchTimer = setTimeout(() => {
      this._asyncSearchTimer = null;

      if (value.length > 0 && value.length < this.minSearchLength()) {
        this.asyncOptions.set([]);
        this.asyncHasMore.set(false);
        this.asyncError.set(null);
        return;
      }

      void this._loadFirstPage('search');
    }, Math.max(0, this.searchDebounce()));
  }

  protected onAsyncContentScroll(event: Event): void {
    const target = event.target as HTMLElement | null;

    if (!target || !this.asyncHasMore() || this.asyncLoading() || this.asyncLoadingMore()) {
      return;
    }

    const threshold = 32;
    const remaining = target.scrollHeight - target.scrollTop - target.clientHeight;

    if (remaining <= threshold) {
      void this._loadNextPage();
    }
  }

  protected retryAsyncLoad(): void {
    void this._loadFirstPage(this.asyncSearch() ? 'search' : 'open');
  }

  protected asyncOptionContext(option: SelectDataSourceOption): SelectOptionContentContext {
    const selected = this._selectedValues(this.value())
      .some(value => this._compareValues(value, option.value));

    return {
      $implicit: option.data === undefined ? option.value : option.data,
      data: option.data === undefined ? option.value : option.data,
      option,
      value: option.value,
      label: option.label,
      selected,
      disabled: option.disabled === true,
      multiple: this.multiple()
    };
  }

  private _selectOption(option: _Option): void {
    if (this.asyncEnabled() && this.multiple()) {
      this._selectAsyncMultipleOption(option);
      return;
    }

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

  private _selectAsyncMultipleOption(option: _Option): void {
    const optionValue = option.value();
    const selectedValues = this._selectedValues(this.value());
    const selectedIndex = selectedValues.findIndex(value => this._compareValues(value, optionValue));
    const nextValues = selectedIndex >= 0
      ? selectedValues.filter((_, index) => index !== selectedIndex)
      : [...selectedValues, optionValue];

    this.value.set(nextValues);
    this._setSelectionByValue(nextValues);
    this._onChange(nextValues);
    this.selectionChange.emit(new SelectChange(this, nextValues));
    this._cdr.markForCheck();
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
    this._scrollOptionElementIntoContainer(option, scrollContainer);
  }

  private _scrollToAsyncOptionValue(value: unknown): void {
    const panel = this.panel()?.nativeElement;

    if (!panel) {
      return;
    }

    const scrollContainer = panel.querySelector('.ngs-select-async-content') as HTMLElement | null;

    if (!scrollContainer) {
      return;
    }

    const option = this.dataSourceOptions()
      .find(option => this._compareValues(option.value(), value));

    if (!option) {
      return;
    }

    this._scrollOptionElementIntoContainer(option.elementRef.nativeElement, scrollContainer);
  }

  private _scrollOptionElementIntoContainer(option: HTMLElement, scrollContainer: HTMLElement): void {
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
      this._setScrollTop(scrollContainer, offsetTop);
    } else if (offsetTop + optionHeight > containerScrollTop + containerHeight) {
      this._setScrollTop(scrollContainer, offsetTop - containerHeight + optionHeight);
    }

    // Дополнительная проверка: если скролл все еще не там, попробуем через getBoundingClientRect
    // но только как fallback, так как offsetTop надежнее если offsetParent настроены верно.
    const containerRect = scrollContainer.getBoundingClientRect();
    const optionRect = option.getBoundingClientRect();

    if (optionRect.top < containerRect.top || optionRect.bottom > containerRect.bottom) {
      const relativeOffsetTop = optionRect.top - containerRect.top + scrollContainer.scrollTop;
      if (relativeOffsetTop < scrollContainer.scrollTop) {
        this._setScrollTop(scrollContainer, relativeOffsetTop);
      } else if (relativeOffsetTop + optionHeight > scrollContainer.scrollTop + containerHeight) {
        this._setScrollTop(scrollContainer, relativeOffsetTop - containerHeight + optionHeight);
      }
    }
  }

  private _setScrollTop(element: HTMLElement, value: number): void {
    try {
      element.scrollTop = value;
    } catch {
      // Some test DOM mocks expose scrollTop as read-only.
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

  private async _loadFirstPage(reason: 'initial' | 'open' | 'search'): Promise<void> {
    await this._loadAsyncPage({ reason, append: false });
  }

  private async _loadNextPage(): Promise<void> {
    await this._loadAsyncPage({ reason: 'page', append: true });
  }

  private async _loadAsyncPage(config: { reason: 'initial' | 'open' | 'search' | 'page'; append: boolean }): Promise<void> {
    const dataSource = this.dataSource();

    if (!dataSource) {
      return;
    }

    if (config.append && (!this.asyncHasMore() || this.asyncLoadingMore())) {
      return;
    }

    this._asyncAbortController?.abort();
    const abortController = new AbortController();
    this._asyncAbortController = abortController;
    const requestId = ++this._asyncRequestId;
    const nextPage = config.append ? this._asyncPage + 1 : 1;
    let firstLoadedOptionValue: unknown;
    let hasLoadedOptionToScroll = false;

    if (config.append) {
      this.asyncLoadingMore.set(true);
    } else {
      this.asyncLoading.set(true);
      this.asyncError.set(null);
      this._asyncPage = 0;
      this._asyncCursor = undefined;
      this.asyncHasMore.set(false);
    }

    try {
      const result = await dataSource({
        search: this.asyncSearch(),
        page: nextPage,
        pageSize: this.pageSize(),
        cursor: config.append ? this._asyncCursor : undefined,
        selectedValues: this._selectedValues(this.value()),
        reason: config.reason,
        signal: abortController.signal
      });

      if (requestId !== this._asyncRequestId || abortController.signal.aborted) {
        return;
      }

      const normalized = this._normalizeAsyncResult(result);
      const items = config.append
        ? this._mergeAsyncOptions(this.asyncOptions(), normalized.items)
        : this._mergeAsyncOptions([], normalized.items);
      const firstLoadedOption = normalized.items[0];

      if (firstLoadedOption) {
        firstLoadedOptionValue = firstLoadedOption.value;
        hasLoadedOptionToScroll = true;
      }

      this.asyncOptions.set(items);
      this._cacheAsyncSelectedOptions(normalized.items);
      this.asyncHasMore.set(!!normalized.hasMore);
      this._asyncCursor = normalized.nextCursor;
      this._asyncPage = nextPage;
      this.asyncError.set(null);
      this._optionsContentChanges.update(v => v + 1);
    } catch (error) {
      if (requestId === this._asyncRequestId && !abortController.signal.aborted) {
        this.asyncError.set(error);
      }
    } finally {
      if (requestId === this._asyncRequestId) {
        this.asyncLoading.set(false);
        this.asyncLoadingMore.set(false);

        if (!this._destroyed) {
          this._cdr.detectChanges();

          if (hasLoadedOptionToScroll) {
            this._scrollToAsyncOptionValue(firstLoadedOptionValue);
          }

          this._cdr.markForCheck();
        }
      }
    }
  }

  private _normalizeAsyncResult(result: SelectDataSourceResult | SelectDataSourceOption[]): SelectDataSourceResult {
    if (Array.isArray(result)) {
      return {
        items: result,
        hasMore: false
      };
    }

    return {
      ...result,
      items: result.items ?? []
    };
  }

  private _mergeAsyncOptions(
    current: SelectDataSourceOption[],
    incoming: SelectDataSourceOption[]
  ): SelectDataSourceOption[] {
    const merged = [...current];

    incoming.forEach(option => {
      const existingIndex = merged.findIndex(currentOption => this._compareValues(currentOption.value, option.value));

      if (existingIndex >= 0) {
        merged[existingIndex] = option;
      } else {
        merged.push(option);
      }
    });

    return merged;
  }

  private _cacheAsyncSelectedOptions(options: SelectDataSourceOption[]): void {
    const selectedValues = this._selectedValues(this.value());

    if (selectedValues.length === 0) {
      this._asyncSelectedCache.set([]);
      return;
    }

    const cached = this._mergeAsyncOptions(this._asyncSelectedCache(), options)
      .filter(option => selectedValues.some(value => this._compareValues(value, option.value)));

    this._asyncSelectedCache.set(cached);
  }

  private _resetAsyncState(): void {
    this._asyncAbortController?.abort();
    this._asyncRequestId++;
    this.asyncOptions.set([]);
    this.asyncSearch.set('');
    this.asyncLoading.set(false);
    this.asyncLoadingMore.set(false);
    this.asyncError.set(null);
    this.asyncHasMore.set(false);
    this._asyncSelectedCache.set([]);
    this._asyncPage = 0;
    this._asyncCursor = undefined;
    this._lastInitialSelectedKey = '';
  }

  private _selectedValues(value: any): unknown[] {
    if (this.multiple()) {
      return Array.isArray(value)
        ? value.filter(item => item !== null && item !== undefined && item !== '')
        : [];
    }

    return value === null || value === undefined || value === '' ? [] : [value];
  }

  private _selectedValuesKey(values: unknown[]): string {
    return values.map(value => `${typeof value}:${String(value)}`).join('|');
  }

  private _viewValueForValue(value: any): string {
    const asyncOption = this._asyncOptionForValue(value);

    if (asyncOption) {
      return asyncOption.label;
    }

    const option = this._optionForValue(value);

    if (option) {
      return option.viewValue;
    }

    return '';
  }

  private _dataForValue(value: any): any {
    const option = this._optionForValue(value);

    if (option) {
      return this._getOptionData(option);
    }

    const asyncOption = this._asyncOptionForValue(value);

    if (this.asyncEnabled()) {
      return asyncOption?.data ?? null;
    }

    return value;
  }

  private _displayOptionForValue(value: any): SelectDataSourceOption | undefined {
    const asyncOption = this._asyncOptionForValue(value);

    if (asyncOption) {
      return asyncOption;
    }

    const option = this._optionForValue(value);

    if (option) {
      const data = this._getOptionData(option);

      return {
        label: option.viewValue,
        value: option.value(),
        data
      };
    }

    return undefined;
  }

  private _optionForValue(value: any): _Option | undefined {
    return this.options().find(option => {
      try {
        return option.value() != null && this._compareValues(option.value(), value);
      } catch {
        return false;
      }
    });
  }

  private _asyncOptionForValue(value: any): SelectDataSourceOption | undefined {
    return [
      ...this.asyncOptions(),
      ...this._asyncSelectedCache()
    ].find(option => this._compareValues(option.value, value));
  }

  private _compareValues(first: unknown, second: unknown): boolean {
    return first === second || Object.is(first, second);
  }
}
