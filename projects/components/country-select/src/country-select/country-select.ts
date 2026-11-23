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
  ChangeDetectionStrategy
} from '@angular/core';
import {
  NgControl,
  FormsModule,
} from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { FormFieldControl, FORM_FIELD } from '@ngstarter-ui/components/form-field';
import { Select, Option, SelectTrigger, SelectChange, SelectHeader } from '@ngstarter-ui/components/select';
import { Subject } from 'rxjs';
import { FocusMonitor } from '@angular/cdk/a11y';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    '[attr.aria-readonly]': 'readonly() || null',
    'class': 'ngs-country-select',
    '[class.floating]': 'shouldLabelFloat',
    '[id]': 'id',
    'tabindex': '-1',
    '(focus)': 'onFocusIn()',
    '(blur)': 'onFocusOut($event)',
  },
})
export class CountrySelect
  implements
    OnInit,
    OnDestroy,
      FormFieldControl<CountrySelectValue>,
    FormValueControl<CountrySelectValue>
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
  readonly value = model<CountrySelectValue>(null);
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false);
  readonly touched = input(false);
  readonly touch = output<void>();
  private readonly _focusedSignal = signal(false);

  readonly idSignal = input(`ngs-country-select-${CountrySelect.nextId++}`, { alias: 'id' });
  placeholderInputSignal = input<string>('', { alias: 'placeholder' });
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
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
    const value = this.value();
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

  private _countryRenderTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearCountrySelectTimeouts();
      this.fm.stopMonitoring(this.elRef.nativeElement);
      this.stateChanges.complete();
    });

    effect(() => {
      this.value();
      this._focusedSignal();
      this.required();
      this.disabled();
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

  get focused(): boolean {
    return this._focusedSignal() || (this.ngsSelect?.()?.focused ?? false);
  }

  onFocusIn() {
    if (!this._focusedSignal()) {
      this._focusedSignal.set(true);
      this.stateChanges.next();
    }
  }

  onFocusOut(event: any) {
    if (!this._elementRef.nativeElement.contains(event.relatedTarget as Element)) {
      this._focusedSignal.set(false);
      this.touch.emit();
      this.stateChanges.next();
    }
  }

  get placeholder(): string {
    return this.placeholderInputSignal();
  }
  set placeholder(plh: string) {
    this.stateChanges.next();
  }

  get empty(): boolean {
    const value = this.value();

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    return !value;
  }

  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }

  get errorState(): boolean {
    return !!((this.invalid() || this.ngControl?.invalid) && this.touched());
  }

  setDescribedByIds(ids: string[]): void {
    const controlElement = this.elRef.nativeElement.querySelector('.select-trigger');

    if (controlElement) {
      controlElement.setAttribute('aria-describedby', ids.join(' '));
    }
  }

  onContainerClick(event: MouseEvent): void {
    if (this.disabled()) {
      return;
    }

    this._focusedSignal.set(true);
    this.ngsSelect().onContainerClick(event);
  }

  onSelectionChange(event: SelectChange): void {
    this.value.set(event.value);
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
    this.opened.emit();
  }

  onSelectClosed(): void {
    this.clearCountrySelectTimeouts();
    this._focusedSignal.set(false);
    this.searchTerm.set('');
    this.visibleCountryCount.set(CountrySelect.COUNTRY_RENDER_CHUNK_SIZE);

    this.closed.emit();
  }

  focus(): void {
    this.ngsSelect()?.focus();
  }

  private getInitialVisibleCountryCount(): number {
    const countries = this.filteredCountries();
    const value = this.value();
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
  }

  private clearCountryRenderTimeout(): void {
    if (!this._countryRenderTimeout) {
      return;
    }

    clearTimeout(this._countryRenderTimeout);
    this._countryRenderTimeout = undefined;
  }

}
