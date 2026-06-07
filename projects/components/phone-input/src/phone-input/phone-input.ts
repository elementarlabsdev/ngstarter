import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  Input as AngularInput,
  OnDestroy,
  OnInit,
  Optional,
  Self,
  booleanAttribute, inject,
  viewChild, input, effect, output, DestroyRef, computed, signal, AfterViewInit
} from '@angular/core';
import { FormGroupDirective, NG_VALIDATORS, NgControl, NgForm, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ErrorStateMatcher, Ripple } from '@ngstarter-ui/components/core';
import { FormFieldControl } from '@ngstarter-ui/components/form-field';
import { Menu, MenuDivider, MenuHeader, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import {
  AsYouType,
  CountryCode as CC,
  PhoneNumber,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';
import { Subject } from 'rxjs';
import { CountryCode } from '../data/country-code';
import { Country } from '../model/country.model';
import { PhoneNumberFormat } from '../model/phone-number-format.model';
import { phoneValidator } from '../phone.validator';
import { Icon } from '@ngstarter-ui/components/icon';
import { Input } from '@ngstarter-ui/components/input';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'ngs-phone-input',
  exportAs: 'ngsPhoneInput',
  templateUrl: './phone-input.html',
  styleUrl: './phone-input.scss',
  imports: [
    Ripple,
    MenuTrigger,
    Icon,
    Menu,
    ReactiveFormsModule,
    FormsModule,
    MenuHeader,
    MenuItem,
    MenuDivider,
    Input,
    Button,
  ],
  providers: [
    CountryCode,
    {
      provide: FormFieldControl,
      useExisting: PhoneInput
    },
    {
      provide: NG_VALIDATORS,
      useValue: phoneValidator,
      multi: true,
    },
  ],
  host: {
    'class': 'ngs-phone-input',
    '[class.is-floating]': 'shouldLabelFloat',
  }
})
export class PhoneInput implements OnInit, AfterViewInit, DoCheck, OnDestroy, FormFieldControl<any> {
  private static readonly COUNTRY_RENDER_CHUNK_SIZE = 32;
  private static readonly COUNTRY_RENDER_CHUNK_DELAY = 50;

  private _destroyRef = inject(DestroyRef);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private countryCodeData = inject(CountryCode);
  private _focusMonitor = inject(FocusMonitor);
  private _elementRef = inject(ElementRef<HTMLElement>)
  private _errorStateMatcher = inject(ErrorStateMatcher);
  private _parentForm = inject(NgForm, { optional: true });

  static nextId = 0;

  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  readonly focusable = viewChild.required<ElementRef>('focusable');

  private _focused = signal(false);
  private _errorState = signal(false);
  id = '';
  private _id = signal(`ngs-phone-input-${PhoneInput.nextId++}`);
  placeholder = '';

  readonly countryChanged = output<Country>();

  stateChanges = new Subject<void>();
  describedBy = '';
  phoneNumber?: string = '';
  allCountries: Country[] = [];
  preferredCountriesInDropDown: Country[] = [];
  selectedCountry = signal<Country | null>(null);
  numberInstance?: PhoneNumber;
  private _value: any;
  searchTerm = signal('');
  visibleCountryCount = signal(PhoneInput.COUNTRY_RENDER_CHUNK_SIZE);
  filteredCountries = computed(() => {
    const searchTerm = this.searchTerm().trim().toLowerCase();

    if (!searchTerm) {
      return this.allCountries;
    }

    return this.allCountries.filter((country) => {
      return `${country.name}${country.phoneCode}`
        .toLowerCase()
        .includes(searchTerm);
    });
  });
  visibleCountries = computed(() => {
    return this.filteredCountries().slice(0, this.visibleCountryCount());
  });

  private _previousFormattedNumber?: string;
  private _countryRenderTimeout: ReturnType<typeof setTimeout> | undefined;
  private _countrySearchFocusTimeout: ReturnType<typeof setTimeout> | undefined;

  onTouched = () => {}
  propagateChange = (_: any) => {}

  get focused(): boolean {
    return this._focused();
  }

  get errorState(): boolean {
    return this._errorState();
  }

  get empty(): boolean {
    return !this.phoneNumber;
  }

  get shouldLabelFloat(): boolean {
    return this._focused() || !this.empty;
  }

  set value(value: any) {
    this.writeValue(value);
  }
  get value(): any {
    return this._value;
  }

  autocomplete = input<AutoFill>('on');
  errorStateMatcher = input<ErrorStateMatcher>(this._errorStateMatcher);
  onlyCountries = input<string[]>([]);
  preferredCountries = input<string[]>([]);
  format = input<PhoneNumberFormat>('default');
  defaultSelectedCountryCode = input<string>('us');
  readonly _placeholder = input<string>('', { alias: 'placeholder' });

  @AngularInput({ alias: 'required', transform: booleanAttribute })
  set required(value: boolean) {
    this._required.set(coerceBooleanProperty(value));
    this.stateChanges.next();
  }
  get required(): boolean {
    return this._required();
  }
  private _required = signal(false);

  phoneDisabled = input(false, {
    alias: 'disabled',
    transform: booleanAttribute
  });

  private _disabled = signal(false);

  private _compositeDisabled = computed(() => {
    return this._disabled() || this.phoneDisabled();
  });
  disabled = false;

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
    _defaultErrorStateMatcher: ErrorStateMatcher,
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }

    effect(() => {
      this.disabled = this._compositeDisabled();
    });
    this._focusMonitor
      .monitor(this._elementRef, true)
      .pipe(
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((origin) => {
        if (this._focused() && !origin) {
          this.onTouched();
        }

        this._focused.set(!!origin);
        this.stateChanges.next();
      });

    this.fetchCountryData();

    effect(() => {
      this.format();

      if (this.numberInstance) {
        this.phoneNumber = this.formattedPhoneNumber;
      }

      this.stateChanges.next();
    });

    effect(() => {
      this.id = this._id();
      this.placeholder = this._placeholder();
    });
  }

  ngOnInit() {
    if (this.onlyCountries().length) {
      this.allCountries = this.allCountries.filter((c) => this.onlyCountries().includes(c.shortCode));
    }

    if (this.preferredCountries().length) {
      this.preferredCountries().forEach((shortCode: string) => {
        const preferredCountry = this.allCountries
          .filter((c) => {
            return c.shortCode === shortCode
          })
          .shift();

        if (preferredCountry) {
          this.preferredCountriesInDropDown.push(preferredCountry);
        }
      });
    }

    if (this.numberInstance && this.numberInstance.country) {
      // If an existing number is present, we use it to determine selectedCountry
      this.selectedCountry.set(this.getCountry(this.numberInstance.country));
    }

    if (!this.selectedCountry()) {
      this.selectedCountry.set(
        this.allCountries.find((country) => country.shortCode === this.defaultSelectedCountryCode()) as Country
      );
    }

    this.countryChanged.emit(this.selectedCountry() as Country);
    this._changeDetectorRef.detectChanges();
    this.stateChanges.next();
  }

  ngDoCheck(): void {
    if (this.ngControl) {
      const isInvalid = this.errorStateMatcher().isErrorState(
        this.ngControl.control,
        this._parentForm
      );
      this._errorState.set(
        (isInvalid && !this.ngControl.control?.value) || (!this._focused() ? isInvalid : false)
      );
    }
  }

  updateErrorState() {
  }

  ngAfterViewInit() {
    this._changeDetectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.clearCountryMenuTimeouts();
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  public onPhoneNumberChange(): void {
    if (!this.phoneNumber) {
      this.clearValue('');
      this.propagateChange(this.value);
      this._changeDetectorRef.markForCheck();
      this.stateChanges.next();
      return;
    }

    try {
      this.numberInstance = parsePhoneNumberFromString(
        this.phoneNumber.toString(),
        this.selectedCountry()?.shortCode.toUpperCase() as CC,
      );
      this.formatAsYouTypeIfEnabled();
      this._value = this.numberInstance?.number ?? this.phoneNumber.toString();

      if (this.numberInstance && this.numberInstance.isValid()) {
        if (this.phoneNumber !== this.formattedPhoneNumber) {
          this.phoneNumber = this.formattedPhoneNumber;
        }
        if (
          this.selectedCountry()?.shortCode !== this.numberInstance.country &&
          this.numberInstance.country
        ) {
          this.selectedCountry.set(this.getCountry(this.numberInstance.country));
          this.countryChanged.emit(this.selectedCountry() as Country);
        }
      }
    } catch (e) {
      // if no possible numbers are there,
      // then the full number is passed so that validator could be triggered and proper error could be shown
      this._value = this.phoneNumber.toString();
    }

    this.propagateChange(this.value);
    this._changeDetectorRef.markForCheck();
    this.stateChanges.next();
  }

  public onCountrySelect(country: Country, el: any): void {
    if (this.phoneNumber) {
      this.phoneNumber = this.numberInstance?.nationalNumber;
    }

    if (this.selectedCountry() !== country) {
      this.reset();
    }

    this.selectedCountry.set(country);
    this.countryChanged.emit(this.selectedCountry() as Country);
    this.onPhoneNumberChange();
    el.focus();
  }

  protected focusSearchInput(): void {
    this.searchInput()?.nativeElement.focus();
  }

  protected openCountryMenu(): void {
    this.visibleCountryCount.set(PhoneInput.COUNTRY_RENDER_CHUNK_SIZE);
    this.scheduleCountryRendering();
    this._countrySearchFocusTimeout = setTimeout(() => this.focusSearchInput());
  }

  protected closeCountryMenu(): void {
    this.clearCountryMenuTimeouts();
    this.searchTerm.set('');
    this.visibleCountryCount.set(PhoneInput.COUNTRY_RENDER_CHUNK_SIZE);
  }

  protected onCountrySearch(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.visibleCountryCount.set(PhoneInput.COUNTRY_RENDER_CHUNK_SIZE);
    this.scheduleCountryRendering();
  }

  protected clearSearch(event: MouseEvent): void {
    event.stopPropagation();
    this.onCountrySearch('');
    this.focusSearchInput();
  }

  private scheduleCountryRendering(): void {
    this.clearCountryRenderTimeout();

    if (this.visibleCountryCount() >= this.filteredCountries().length) {
      return;
    }

    this._countryRenderTimeout = setTimeout(() => {
      this.visibleCountryCount.update((count) => {
        return Math.min(
          count + PhoneInput.COUNTRY_RENDER_CHUNK_SIZE,
          this.filteredCountries().length
        );
      });
      this.scheduleCountryRendering();
      this._changeDetectorRef.markForCheck();
    }, PhoneInput.COUNTRY_RENDER_CHUNK_DELAY);
  }

  private clearCountryMenuTimeouts(): void {
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

  public getCountry(shortCode: CC): Country {
    return (this.allCountries.find((c) => c.shortCode === shortCode.toLowerCase()) || {
      name: 'UN',
      shortCode: 'UN',
      dialCode: undefined,
      priority: 0,
      areaCodes: undefined,
      flagClass: 'UN',
      placeHolder: '',
    }) as Country;
  }

  public onInputKeyPress(event: any): void {
    const pattern = /[0-9+\- ]/;

    if (!pattern.test(event.key)) {
      event.preventDefault();
    }
  }

  protected fetchCountryData(): void {
    this.allCountries = this.countryCodeData.allCountries;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
    this._changeDetectorRef.detectChanges();
    this.stateChanges.next();
  }

  writeValue(value: any): void {
    if (!value) {
      this.clearValue(value);
      this.stateChanges.next();
      this._changeDetectorRef.detectChanges();
      return;
    }

    this._value = value;
    this.numberInstance = parsePhoneNumberFromString(value);

    if (this.numberInstance) {
      const countryCode = this.numberInstance.country;
      this.phoneNumber = this.formattedPhoneNumber;

      if (!countryCode) {
        this.stateChanges.next(undefined);
        this._changeDetectorRef.detectChanges();
        return;
      }

      const country = this.getCountry(countryCode);
      this.selectedCountry.set(country);
      this.countryChanged.emit(country);
      this._changeDetectorRef.detectChanges();
      this.stateChanges.next();
    } else {
      this.phoneNumber = value;
    }

    this.stateChanges.next(undefined);
    // Value is set from outside using setValue()
    this._changeDetectorRef.detectChanges();
  }

  setDescribedByIds(ids: string[]): void {
    this.describedBy = ids.join(' ');
  }

  focus(): void {
    this.focusable().nativeElement.focus();
  }

  onContainerClick(event: MouseEvent): void {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this.focus();
    }
  }

  reset(): void {
    this.clearValue(null);
    this.propagateChange(null);
    this._changeDetectorRef.markForCheck();
    this.stateChanges.next(undefined);
  }

  private clearValue(value: any): void {
    this._value = value ?? '';
    this.phoneNumber = '';
    this.numberInstance = undefined;
    this._previousFormattedNumber = undefined;
  }

  private get formattedPhoneNumber(): string {
    if (!this.numberInstance) {
      return this.phoneNumber?.toString() || '';
    }
    switch (this.format()) {
      case 'national':
        return this.numberInstance.formatNational();
      case 'international':
        return this.numberInstance.formatInternational();
      default:
        return this.numberInstance.nationalNumber.toString();
    }
  }

  private formatAsYouTypeIfEnabled(): void {
    if (this.format() === 'default') {
      return
    }

    const selectedCountry = this.selectedCountry();
    if (!selectedCountry) {
      return;
    }

    const asYouType: AsYouType = new AsYouType(selectedCountry.shortCode.toUpperCase() as CC);

    // To avoid caret positioning, we apply formatting only if the caret is at the end:
    if (!this.phoneNumber) {
      return;
    }

    if (this.phoneNumber?.toString().startsWith(this._previousFormattedNumber || '')) {
      this.phoneNumber = asYouType.input(this.phoneNumber.toString());
    }
    this._previousFormattedNumber = this.phoneNumber.toString();
  }
}
