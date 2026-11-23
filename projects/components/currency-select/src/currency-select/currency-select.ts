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
import { Icon } from '@ngstarter-ui/components/icon';
import { Currency } from '../currency.interface';
import { currencies } from '../currencies';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'ngs-currency-select',
  exportAs: 'ngsCurrencySelect',
  templateUrl: './currency-select.html',
  styleUrl: './currency-select.scss',
  providers: [
    {
      provide: FormFieldControl,
      useExisting: forwardRef(() => CurrencySelect),
    },
  ],
  host: {
    '[attr.aria-readonly]': 'readonly() || null',
    'class': 'ngs-currency-select',
    '[class.floating]': 'shouldLabelFloat',
    '[id]': 'id',
    'tabindex': '-1',
    '(focus)': 'onFocusIn()',
    '(blur)': 'onFocusOut($event)',
  },
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    Option,
    Icon,

    Select,
    SelectHeader,
    SelectTrigger,
    FormsModule,
    Button
  ]
})
export class CurrencySelect
  implements
    OnInit,
    OnDestroy,
      FormFieldControl<string | null>,
    FormValueControl<string | null>
{
  private static readonly CURRENCY_RENDER_CHUNK_SIZE = 32;
  private static readonly CURRENCY_RENDER_CHUNK_DELAY = 50;

  private _elementRef = inject(ElementRef);
  private _renderer = inject(Renderer2);
  private _formField = inject(FORM_FIELD, { optional: true });

  static nextId = 0;
  id = `ngs-currency-select-${CurrencySelect.nextId++}`;

  readonly stateChanges = new Subject<void>();
  controlType = 'ngs-currency-select';
  autofilled?: boolean;

  protected searchTerm = model('');
  protected visibleCurrencyCount = signal(CurrencySelect.CURRENCY_RENDER_CHUNK_SIZE);
  readonly value = model<string | null>(null);
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false);
  readonly touched = input(false);
  readonly touch = output<void>();
  private readonly _focusedSignal = signal(false);

  placeholderInputSignal = input<string>('', { alias: 'placeholder' });
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  showCountryName = input(false, {
    transform: booleanAttribute
  });

  readonly internalCurrencies: Currency[] = currencies;

  readonly filteredCurrencies = computed(() => {
    const term = this.searchTerm();
    const currencies = this.internalCurrencies;
    if (!term || term.trim() === '') {
      return currencies;
    }
    const filterValue = term.trim().toLowerCase();
    return currencies.filter(currency =>
      currency.name.toLowerCase().includes(filterValue) ||
      currency.code.toLowerCase().includes(filterValue)
    );
  });
  readonly visibleCurrencies = computed(() => {
    return this.filteredCurrencies().slice(0, this.visibleCurrencyCount());
  });

  readonly selectedCurrencyDisplay = computed(() => {
    return this.internalCurrencies.find(c => c.code === this.value());
  });

  readonly ngsSelect = viewChild<Select>('ngsSelect');
  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  private readonly fm = inject(FocusMonitor);
  private readonly elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  public readonly ngControl = inject(NgControl, { self: true, optional: true });
  private readonly destroyRef = inject(DestroyRef);

  readonly opened = output<void>();
  readonly closed = output<void>();

  private _currencyRenderTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearCurrencySelectTimeouts();
      this.fm.stopMonitoring(this.elRef.nativeElement);
      this.stateChanges.complete();
    });

    effect(() => {
      this.value();
      this._focusedSignal();
      this.required();
      this.disabled();
      this.placeholderInputSignal();
      this.ngControl?.control?.status;
      this.stateChanges.next();
    });
  }

  ngOnInit(): void {
    if (this._formField) {
      this._renderer.addClass(this._formField.elementRef.nativeElement, 'ngs-form-field-type-currency-select');
    }
  }

  ngOnDestroy(): void {
    this.clearCurrencySelectTimeouts();
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
    return !this.value();
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
    this.ngsSelect()?.onContainerClick(event);
  }

  onSelectionChange(event: SelectChange): void {
    this.value.set(event.value);
  }

  clearSearch(event: MouseEvent): void {
    event.stopPropagation();
    this.onCurrencySearch('');
    this.searchInput()?.nativeElement.focus();
  }

  onCurrencySearch(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.visibleCurrencyCount.set(CurrencySelect.CURRENCY_RENDER_CHUNK_SIZE);
    this.scheduleCurrencyRendering();
  }

  onSelectOpened(): void {
    this.visibleCurrencyCount.set(this.getInitialVisibleCurrencyCount());
    this.scheduleCurrencyRendering();
    this.opened.emit();
  }

  onSelectClosed(): void {
    this.clearCurrencySelectTimeouts();
    this._focusedSignal.set(false);
    this.searchTerm.set('');
    this.visibleCurrencyCount.set(CurrencySelect.CURRENCY_RENDER_CHUNK_SIZE);

    this.closed.emit();
  }

  focus(): void {
    this.ngsSelect()?.focus();
  }

  private getInitialVisibleCurrencyCount(): number {
    const currencies = this.filteredCurrencies();
    const selectedCurrencyCode = this.value();

    if (!selectedCurrencyCode) {
      return CurrencySelect.CURRENCY_RENDER_CHUNK_SIZE;
    }

    const selectedCurrencyIndex = currencies.findIndex((currency) => currency.code === selectedCurrencyCode);

    if (selectedCurrencyIndex === -1) {
      return CurrencySelect.CURRENCY_RENDER_CHUNK_SIZE;
    }

    return Math.min(
      Math.max(selectedCurrencyIndex + 1, CurrencySelect.CURRENCY_RENDER_CHUNK_SIZE),
      currencies.length
    );
  }

  private scheduleCurrencyRendering(): void {
    this.clearCurrencyRenderTimeout();

    if (this.visibleCurrencyCount() >= this.filteredCurrencies().length) {
      return;
    }

    this._currencyRenderTimeout = setTimeout(() => {
      this.visibleCurrencyCount.update((count) => {
        return Math.min(
          count + CurrencySelect.CURRENCY_RENDER_CHUNK_SIZE,
          this.filteredCurrencies().length
        );
      });
      this.scheduleCurrencyRendering();
    }, CurrencySelect.CURRENCY_RENDER_CHUNK_DELAY);
  }

  private clearCurrencySelectTimeouts(): void {
    this.clearCurrencyRenderTimeout();
  }

  private clearCurrencyRenderTimeout(): void {
    if (!this._currencyRenderTimeout) {
      return;
    }

    clearTimeout(this._currencyRenderTimeout);
    this._currencyRenderTimeout = undefined;
  }

}
