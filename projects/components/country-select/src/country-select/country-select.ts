import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  forwardRef,
  inject,
  signal,
  computed,
  effect,
  model,
  input,
  DestroyRef, viewChild, Renderer2, booleanAttribute, output,
} from '@angular/core';
import {
  ControlValueAccessor,
  NgControl,
  ReactiveFormsModule, FormsModule,
} from '@angular/forms';
import { FormFieldControl, FORM_FIELD } from '@ngstarter-ui/components/form-field';
import { Select, Option, SelectTrigger, SelectChange, SelectHeader } from '@ngstarter-ui/components/select';
import { Subject } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { FocusMonitor } from '@angular/cdk/a11y';
import { toSignal } from '@angular/core/rxjs-interop';
import { Country } from '../country.interface';
import { Icon } from '@ngstarter-ui/components/icon';
import { countries } from '../countries';
import { Button } from '@ngstarter-ui/components/button';

export type CountrySelectValue = string | string[] | null;

@Component({
  selector: 'ngs-country-select',
  exportAs: 'ngsCountrySelect',
  imports: [
    Option,
    Icon,
    Select,
    SelectTrigger,
    ReactiveFormsModule,
    Button,
    SelectHeader,
    FormsModule
  ],
  templateUrl: './country-select.html',
  styleUrl: './country-select.scss',
  providers: [
    {
      provide: FormFieldControl,
      useExisting: forwardRef(() => CountrySelect),
    },
  ],
  host: {
    'class': 'ngs-country-select',
    '[class.floating]': 'shouldLabelFloat',
    '[id]': 'id',
    '[attr.tabindex]': 'disabled ? -1 : tabIndex()',
    '(focus)': 'onFocusIn()',
    '(blur)': 'onFocusOut($event)',
  },
})
export class CountrySelect
  implements
    OnInit,
    OnDestroy,
    ControlValueAccessor,
    FormFieldControl<CountrySelectValue>
{
  private static readonly COUNTRY_RENDER_CHUNK_SIZE = 32;
  private static readonly COUNTRY_RENDER_CHUNK_DELAY = 50;

  private _elementRef = inject(ElementRef);
  private _renderer = inject(Renderer2);
  private _formField = inject(FORM_FIELD, { optional: true });

  static nextId = 0;

  readonly stateChanges = new Subject<void>();

  protected searchTerm = model('');
  protected visibleCountryCount = signal(CountrySelect.COUNTRY_RENDER_CHUNK_SIZE);
  readonly valueSignal = model<CountrySelectValue>(null, { alias: 'value' });
  private readonly _focusedSignal = signal(false);
  private _touched = false;

  readonly idSignal = input(`ngs-country-select-${CountrySelect.nextId++}`, { alias: 'id' });
  placeholderInputSignal = input<string>('', { alias: 'placeholder' });
  isRequiredSignal = model<boolean>(false, { alias: 'required' });
  isDisabledSignal = model<boolean>(false, { alias: 'disabled' });
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly hideCheckIcon = input(false, { transform: booleanAttribute });
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly tabIndex = input<number, any>(0, {
    transform: (value: number | string | null) => value == null ? 0 : parseInt(value + '', 10)
  });
  readonly ariaDescribedby = input<string | null>(null, { alias: 'aria-describedby' });

  readonly showCountryCode = input(false, {
    transform: booleanAttribute
  });

  readonly internalCountries: Country[] = countries;

  readonly filteredCountries = computed(() => {
    const term = this.searchTerm();
    const countries = this.internalCountries;
    if (!term || term.trim() === '') {
      return countries;
    }
    const filterValue = term.trim().toLowerCase();
    return countries.filter(country =>
      country.name.toLowerCase().includes(filterValue) ||
      country.code.toLowerCase().includes(filterValue)
    );
  });

  readonly visibleCountries = computed(() => {
    return this.filteredCountries().slice(0, this.visibleCountryCount());
  });

  readonly selectedCountryDisplays = computed(() => {
    const value = this.valueSignal();
    const selectedCodes = Array.isArray(value)
      ? value
      : value
        ? [value]
        : [];

    return selectedCodes
      .map((code) => this.internalCountries.find((country) => country.code === code))
      .filter((country): country is Country => !!country);
  });

  readonly selectedCountryDisplay = computed(() => {
    return this.selectedCountryDisplays()[0] ?? null;
  });

  readonly selectedCountriesText = computed(() => {
    return this.selectedCountryDisplays()
      .map((country) => {
        if (this.showCountryCode()) {
          return `${country.name} (${country.code})`;
        }

        return country.name;
      })
      .join(', ');
  });

  readonly ngsSelect = viewChild.required<Select>('ngsSelect');
  readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  private readonly fm = inject(FocusMonitor);
  private readonly elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  public readonly ngControl = inject(NgControl, { self: true, optional: true });
  private readonly destroyRef = inject(DestroyRef);

  readonly opened = output<void>();
  readonly closed = output<void>();
  readonly selectionChange = output<SelectChange>();

  private onChangeFn: (value: CountrySelectValue) => void = () => {};
  private onTouchedFn: () => void = () => {};
  private _countryRenderTimeout: ReturnType<typeof setTimeout> | undefined;
  private _countrySearchFocusTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this.destroyRef.onDestroy(() => {
      this.clearCountrySelectTimeouts();
      this.fm.stopMonitoring(this.elRef.nativeElement);
      this.stateChanges.complete();
    });

    effect(() => {
      this.onChangeFn(this.valueSignal());
    });

    effect(() => {
      this.valueSignal();
      this._focusedSignal();
      this.isRequiredSignal();
      this.isDisabledSignal();
      this.placeholderInputSignal();
      this.multiple();
      this.hideCheckIcon();
      this.clearable();
      this.ariaLabel();
      this.tabIndex();
      this.ariaDescribedby();
      this.ngControl?.control?.status;
      this.stateChanges.next();
    });
  }

  ngOnInit(): void {
    if (this.ngControl?.control) {
      const control = this.ngControl.control;

      if (control.validator) {
        const validator = control.validator({} as any);
        if (validator && validator['required']) {
          this.isRequiredSignal.set(true);
        }
      }

      this.isDisabledSignal.set(control.disabled);
    }

    if (this._formField) {
      this._renderer.addClass(this._formField.elementRef.nativeElement, 'ngs-form-field-type-country-select');
    }
  }

  ngOnDestroy(): void {
    this.clearCountrySelectTimeouts();
  }

  get id(): string {
    return this.idSignal();
  }

  get value(): CountrySelectValue {
    return this.valueSignal();
  }
  set value(val: CountrySelectValue) {
    this.valueSignal.set(val);
  }

  get focused(): boolean {
    return this._focusedSignal() || (this.ngsSelect?.()?.panelOpen() ?? false);
  }

  onFocusIn() {
    if (!this._focusedSignal()) {
      this._focusedSignal.set(true);
      this.stateChanges.next();
    }
  }

  onFocusOut(event: any) {
    if (!this._elementRef.nativeElement.contains(event.relatedTarget as Element)) {
      this._touched = true;
      this._focusedSignal.set(false);
      this.onTouchedFn();
      this.stateChanges.next();
    }
  }

  get placeholder(): string {
    return this.placeholderInputSignal();
  }
  set placeholder(plh: string) {
    this.stateChanges.next();
  }

  get required(): boolean {
    return this.isRequiredSignal();
  }
  set required(req: boolean) {
    this.isRequiredSignal.set(coerceBooleanProperty(req));
  }

  get disabled(): boolean {
    return this.isDisabledSignal();
  }
  set disabled(dis: boolean) {
    this.isDisabledSignal.set(coerceBooleanProperty(dis));
  }

  get empty(): boolean {
    const value = this.valueSignal();

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    return !value;
  }

  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }

  get errorState(): boolean {
    return !!(this.ngControl?.invalid && (this.ngControl?.touched || this._touched));
  }

  get touched(): boolean {
    return this._touched;
  }

  setDescribedByIds(ids: string[]): void {
    const controlElement = this.elRef.nativeElement.querySelector('.select-trigger');

    if (controlElement) {
      controlElement.setAttribute('aria-describedby', ids.join(' '));
    }
  }

  onContainerClick(): void {
    if (this.disabled) {
      return;
    }

    this._focusedSignal.set(true);
    this.ngsSelect().open();
  }

  writeValue(value: CountrySelectValue): void {
    this.valueSignal.set(value);
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedFn = () => {
      this._touched = true;
      fn();
      this.stateChanges.next();
    };
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelectionChange(event: SelectChange): void {
    this.value = event.value;
    this.onTouchedFn();
    this.selectionChange.emit(event);
  }

  clearSearch(event: MouseEvent): void {
    event.stopPropagation();
    this.onCountrySearch('');
    this.searchInput().nativeElement.focus();
  }

  onCountrySearch(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.visibleCountryCount.set(CountrySelect.COUNTRY_RENDER_CHUNK_SIZE);
    this.scheduleCountryRendering();
  }

  onSelectOpened(): void {
    this.visibleCountryCount.set(this.getInitialVisibleCountryCount());
    this.scheduleCountryRendering();
    this._countrySearchFocusTimeout = setTimeout(() => {
      this.searchInput().nativeElement.focus();
    });
    this.opened.emit();
  }

  onSelectClosed(): void {
    this.clearCountrySelectTimeouts();
    this._focusedSignal.set(false);
    this.searchTerm.set('');
    this.visibleCountryCount.set(CountrySelect.COUNTRY_RENDER_CHUNK_SIZE);

    if (!this._touched) {
      this.onTouchedFn();
    }
    this.closed.emit();
  }

  focus(): void {
    this.ngsSelect()?.focus();
  }

  private getInitialVisibleCountryCount(): number {
    const countries = this.filteredCountries();
    const value = this.valueSignal();
    const selectedCountryCode = Array.isArray(value) ? value[0] : value;

    if (!selectedCountryCode) {
      return CountrySelect.COUNTRY_RENDER_CHUNK_SIZE;
    }

    const selectedCountryIndex = countries.findIndex((country) => country.code === selectedCountryCode);

    if (selectedCountryIndex === -1) {
      return CountrySelect.COUNTRY_RENDER_CHUNK_SIZE;
    }

    return Math.min(
      Math.max(selectedCountryIndex + 1, CountrySelect.COUNTRY_RENDER_CHUNK_SIZE),
      countries.length
    );
  }

  private scheduleCountryRendering(): void {
    this.clearCountryRenderTimeout();

    if (this.visibleCountryCount() >= this.filteredCountries().length) {
      return;
    }

    this._countryRenderTimeout = setTimeout(() => {
      this.visibleCountryCount.update((count) => {
        return Math.min(
          count + CountrySelect.COUNTRY_RENDER_CHUNK_SIZE,
          this.filteredCountries().length
        );
      });
      this.scheduleCountryRendering();
    }, CountrySelect.COUNTRY_RENDER_CHUNK_DELAY);
  }

  private clearCountrySelectTimeouts(): void {
    this.clearCountryRenderTimeout();
    this.clearCountrySearchFocusTimeout();
  }

  private clearCountryRenderTimeout(): void {
    if (!this._countryRenderTimeout) {
      return;
    }

    clearTimeout(this._countryRenderTimeout);
    this._countryRenderTimeout = undefined;
  }

  private clearCountrySearchFocusTimeout(): void {
    if (!this._countrySearchFocusTimeout) {
      return;
    }

    clearTimeout(this._countrySearchFocusTimeout);
    this._countrySearchFocusTimeout = undefined;
  }
}
