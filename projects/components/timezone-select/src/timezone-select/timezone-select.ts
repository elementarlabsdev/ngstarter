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
  FormsModule,
  NgControl
} from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
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
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './timezone-select.html',
  styleUrl: './timezone-select.scss',
  host: {
    '[attr.aria-readonly]': 'readonly() || null',
    'class': 'ngs-timezone-select',
    '[id]': 'id',
    'tabindex': '-1',
    '(focus)': 'onFocusIn()',
    '(blur)': 'onFocusOut($event)',
  }
})
export class TimezoneSelect implements OnInit, FormFieldControl<string>, FormValueControl<string | null> {
  protected localeId = inject(LOCALE_ID);
  protected renderer = inject(Renderer2);
  private readonly _focusMonitor = inject(FocusMonitor);
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _formField = inject(FORM_FIELD, { optional: true });
  ngControl = inject(NgControl, { optional: true, self: true });

  private searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');
  private selectRef = viewChild.required<Select>('select');

  protected timezoneGroups = signal<TimezoneGroup[]>([]);
  readonly touched = input(false);
  readonly invalid = input(false);
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly touch = output<void>();
  readonly stateChanges = new Subject<void>();
  readonly controlType = 'ngs-timezone-select';
  readonly id = `ngs-timezone-select-${nextId++}`;
  readonly _userAriaDescribedBy = input<string>('', { alias: 'aria-describedby' });
  readonly locale = input<string>(this.localeId);
  readonly _placeholder = input<string>('', { alias: 'placeholder' });
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly value = model<string | null>(null);
  readonly searchTerm = signal('');
  private readonly _focused = signal(false);

  readonly opened = output<void>();
  readonly closed = output<void>();

  get focused(): boolean {
    return this._focused() || (this.selectRef?.()?.focused ?? false);
  }

  get empty() {
    return !this.value() || this.value()?.trim() === '';
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

  get errorState(): boolean {
    return !!(this.invalid() || this.ngControl?.invalid) && this.touched();
  }

  constructor() {
    effect(() => {
      // Read signals to trigger effect.
      this._placeholder();
      this.required();
      this.disabled();
      this._focused();
      this.value();
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
      this._focused.set(false);
      this.stateChanges.next();
    }
  }

  onContainerClick(event: MouseEvent) {
    if (this.disabled()) {
      return;
    }

    this.focus();
    this.selectRef().onContainerClick(event);
  }

  setDescribedByIds(ids: string[]) {
    const controlElement = this._elementRef.nativeElement.querySelector('.ngs-select-trigger');

    if (controlElement) {
      controlElement.setAttribute('aria-describedby', ids.join(' '));
    }
  }

  protected onSelectOpened(): void {
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

  focus(): void {
    this.selectRef().focus();
  }
}
