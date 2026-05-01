import {
  booleanAttribute, ChangeDetectionStrategy,
  Component, computed, effect, ElementRef,
  forwardRef,
  inject,
  input,
  LOCALE_ID, model,
  OnInit, Renderer2,
  signal, untracked, viewChild, output
} from '@angular/core';
import { TimezoneGroup, TimezoneUtils } from '../timezone-utils';
import { Select, Option, SelectHeader, SelectBody, Optgroup } from '@ngstarter-ui/components/select';
import {
  ControlValueAccessor, FormsModule,
  NgControl
} from '@angular/forms';
import { FormFieldControl, FORM_FIELD } from '@ngstarter-ui/components/form-field';
import { Subject } from 'rxjs';
import { FocusMonitor } from '@angular/cdk/a11y';
import { FilterTimezonesPipe } from '../filter-timezones.pipe';
import { Icon } from '@ngstarter-ui/components/icon';
import { Button } from '@ngstarter-ui/components/button';

let nextId = 0;

@Component({
  selector: 'ngs-timezone-select',
  exportAs: 'ngsTimezoneSelect',
  imports: [
    Select,
    Option,
    FormsModule,
    FilterTimezonesPipe,
    Icon,
    Button,
    SelectHeader,
    SelectBody,
    Optgroup
  ],
  providers: [
    {
      provide: FormFieldControl,
      useExisting: forwardRef(() => TimezoneSelect),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './timezone-select.html',
  styleUrl: './timezone-select.scss',
  host: {
    'class': 'ngs-timezone-select',
    '[id]': 'id',
    '[attr.tabindex]': 'disabled ? -1 : 0',
    '(focus)': 'onFocusIn()',
    '(blur)': 'onFocusOut($event)',
  }
})
export class TimezoneSelect implements OnInit, FormFieldControl<any>, ControlValueAccessor {
  protected localeId = inject(LOCALE_ID);
  protected renderer = inject(Renderer2);
  private readonly _focusMonitor = inject(FocusMonitor);
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _formField = inject(FORM_FIELD, { optional: true });
  ngControl = inject(NgControl, { optional: true, self: true });

  private searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');
  private selectRef = viewChild.required<Select>('select');

  protected timezoneGroups = signal<TimezoneGroup[]>([]);
  readonly touched = signal(false);
  readonly stateChanges = new Subject<void>();
  readonly controlType = 'ngs-timezone-select';
  readonly id = `ngs-timezone-select-${nextId++}`;
  readonly _userAriaDescribedBy = input<string>('', { alias: 'aria-describedby' });
  readonly locale = input<string>(this.localeId);
  readonly _placeholder = input<string>('', { alias: 'placeholder' });
  readonly _required = input<boolean, unknown>(false, {
    alias: 'required',
    transform: booleanAttribute,
  });
  readonly _disabledByInput = input<boolean, unknown>(false, {
    alias: 'disabled',
    transform: booleanAttribute,
  });
  readonly _value = model<string | null>(null, { alias: 'value' });
  protected searchTerm = model('');
  private readonly _focused = signal(false);
  private readonly _disabledByCva = signal(false);
  private readonly _disabled = computed(() => this._disabledByInput() || this._disabledByCva());

  readonly opened = output<void>();
  readonly closed = output<void>();

  onChange = (_: any) => {};
  onTouched = () => {};

  get focused(): boolean {
    return this._focused() || (this.selectRef?.()?.panelOpen() ?? false);
  }

  get empty() {
    return !this._value() || this._value()?.trim() === '';
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  get userAriaDescribedBy() {
    return this._userAriaDescribedBy();
  }

  get placeholder(): string {
    return this._placeholder();
  }

  get required(): boolean {
    return this._required();
  }

  get disabled(): boolean {
    return this._disabled();
  }

  get value(): string | null {
    return this._value();
  }

  get errorState(): boolean {
    // @ts-ignore
    return this.ngControl?.invalid && this.touched();
  }

  constructor() {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }

    effect(() => {
      const value = this._value();
      untracked(() => {
        this.onChange(value);
        this.stateChanges.next();
      });
    });

    effect(() => {
      // Read signals to trigger effect.
      this._placeholder();
      this._required();
      this._disabled();
      this._focused();
      this._value();
      this.selectRef()?.panelOpen();
      // Propagate state changes.
      untracked(() => this.stateChanges.next());
    });
  }

  ngOnInit() {
    const locale = this.locale() || this.localeId;
    this.timezoneGroups.set(TimezoneUtils.getLocalizedAll(locale, true));

    if (this._formField) {
      this.renderer.addClass(this._formField.elementRef.nativeElement, 'ngs-form-field-type-timezone-select');
    }
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  onFocusIn() {
    if (!this._focused()) {
      this._focused.set(true);
      this.stateChanges.next();
    }
  }

  onFocusOut(event: any) {
    if (!this._elementRef.nativeElement.contains(event.relatedTarget as Element)) {
      this.touched.set(true);
      this._focused.set(false);
      this.onTouched();
      this.stateChanges.next();
    }
  }

  onContainerClick(event: MouseEvent) {
    if (this.disabled) {
      return;
    }

    this.focus();
  }

  setDescribedByIds(ids: string[]) {
    const controlElement = this._elementRef.nativeElement.querySelector('.ngs-select-trigger');

    if (controlElement) {
      controlElement.setAttribute('aria-describedby', ids.join(' '));
    }
  }

  writeValue(timezone: string | null): void {
    this._updateValue(timezone);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabledByCva.set(isDisabled);
  }

  protected onSelectOpened(): void {
    setTimeout(() => {
      this.searchInput().nativeElement.focus();
    });
    this.opened.emit();
  }

  clearSearch(event: MouseEvent): void {
    event.stopPropagation();
    this.searchTerm.set('');
    this.searchInput().nativeElement.focus();
  }

  protected onSelectClosed() {
    this._focused.set(false);
    this.searchTerm.set('');
    this.closed.emit();
    this.stateChanges.next();
  }

  private _updateValue(value: string | null) {
    const current = this._value();

    if (current === value) {
      return;
    }

    this._value.set(value);
  }

  focus(): void {
    this._elementRef.nativeElement.focus();
    setTimeout(() => {
      this.selectRef().open();
    });
  }
}
