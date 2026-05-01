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
import { FormFieldControl, FORM_FIELD } from '@ngstarter/components/form-field';
import { Select, Option, SelectTrigger, SelectChange, SelectHeader } from '@ngstarter/components/select';
import { Subject } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { FocusMonitor } from '@angular/cdk/a11y';
import { toSignal } from '@angular/core/rxjs-interop';
import { Country } from '../country.interface';
import { Icon } from '@ngstarter/components/icon';
import { countries } from '../countries';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'ngs-country-select',
  standalone: true,
  exportAs: 'ngsCountrySelect',
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
    '[attr.tabindex]': 'disabled ? -1 : 0',
    '(focus)': 'onFocusIn()',
    '(blur)': 'onFocusOut($event)',
  },
  imports: [
    Option,
    Icon,

    Select,
    SelectTrigger,
    ReactiveFormsModule,
    Button,
    SelectHeader,
    FormsModule
  ]
})
export class CountrySelect
  implements
    OnInit,
    OnDestroy,
    ControlValueAccessor,
    FormFieldControl<string | null>
{
  private _elementRef = inject(ElementRef);
  private _renderer = inject(Renderer2);
  private _formField = inject(FORM_FIELD, { optional: true });

  static nextId = 0;
  id = `ngs-country-select-${CountrySelect.nextId++}`;

  readonly stateChanges = new Subject<void>();

  protected searchTerm = model('');
  private readonly _valueSignal = signal<string | null>(null);
  private readonly _focusedSignal = signal(false);
  private _touched = false;

  placeholderInputSignal = input<string>('', { alias: 'placeholder' });
  isRequiredSignal = model<boolean>(false, { alias: 'required' });
  isDisabledSignal = model<boolean>(false, { alias: 'disabled' });

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

  readonly selectedCountryDisplay = computed(() => {
    return this.internalCountries.find(c => c.code === this._valueSignal());
  });

  readonly ngsSelect = viewChild.required<Select>('ngsSelect');
  readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  private readonly fm = inject(FocusMonitor);
  private readonly elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  public readonly ngControl = inject(NgControl, { self: true, optional: true });
  private readonly destroyRef = inject(DestroyRef);

  readonly opened = output<void>();
  readonly closed = output<void>();

  private onChangeFn: (value: string | null) => void = () => {};
  private onTouchedFn: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this.destroyRef.onDestroy(() => {
      this.fm.stopMonitoring(this.elRef.nativeElement);
      this.stateChanges.complete();
    });

    effect(() => {
      this.onChangeFn(this._valueSignal());
    });

    effect(() => {
      this._valueSignal();
      this._focusedSignal();
      this.isRequiredSignal();
      this.isDisabledSignal();
      this.placeholderInputSignal();
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
  }

  get value(): string | null {
    return this._valueSignal();
  }
  set value(val: string | null) {
    this._valueSignal.set(val);
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
    return !this._valueSignal();
  }

  get shouldLabelFloat(): boolean {
    return this._focusedSignal() || !this.empty;
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

  writeValue(value: string | null): void {
    this._valueSignal.set(value);
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
  }

  clearSearch(event: MouseEvent): void {
    event.stopPropagation();
    this.searchTerm.set('');
    this.searchInput().nativeElement.focus();
  }

  onSelectOpened(): void {
    setTimeout(() => {
      this.searchInput().nativeElement.focus();
    });
    this.opened.emit();
  }

  onSelectClosed(): void {
    this._focusedSignal.set(false);
    this.searchTerm.set('');

    if (!this._touched) {
      this.onTouchedFn();
    }
    this.closed.emit();
  }

  focus(): void {
    this.ngsSelect()?.focus();
  }
}
