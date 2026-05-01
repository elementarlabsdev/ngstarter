import {
  Component,
  ElementRef,
  booleanAttribute,
  output,
  input,
  signal,
  inject,
  forwardRef,
  AfterViewInit, OnDestroy, ChangeDetectorRef
} from '@angular/core';
import { OPTION, OPTION_PARENT, _Option, _OptionParent } from './option-tokens';
import { Checkbox } from '@ngstarter-ui/components/checkbox';
import { Icon } from '@ngstarter-ui/components/icon';
import { Highlightable } from '@angular/cdk/a11y';

@Component({
  selector: 'ngs-option',
  exportAs: 'ngsOption',
  standalone: true,
  imports: [
    Checkbox,
    Icon
  ],
  templateUrl: './option.html',
  styleUrl: './option.scss',
  providers: [
    {
      provide: OPTION,
      useExisting: forwardRef(() => Option)
    }
  ],
  host: {
    'role': 'option',
    '[attr.tabindex]': '-1',
    '[class.ngs-option-selected]': 'selected',
    '[class.ngs-option-disabled]': 'disabled',
    '[class.ngs-option-multiple]': 'multiple',
    '[class.ngs-option-active]': 'active',
    '[attr.aria-selected]': 'selected',
    '[attr.aria-disabled]': 'disabled',
    '(click)': '_onClick($event)'
  }
})
export class Option implements AfterViewInit, OnDestroy, _Option, Highlightable {
  private _parent = inject<_OptionParent>(OPTION_PARENT, { optional: true });
  private _cdr = inject(ChangeDetectorRef);

  value = input<any>();
  disabledSignal = input(false, { alias: 'disabled', transform: booleanAttribute });
  selectedInput = input(false, { alias: 'selected', transform: booleanAttribute });

  get disabled(): boolean {
    return this.disabledSignal();
  }

  readonly onSelectionChange = output<_Option>();

  private _selected = signal(false);
  private _active = signal(false);
  private _mutationObserver?: MutationObserver;

  constructor(public elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    this._parent?._optionsContentChanges?.update(v => v + 1);

    if (typeof MutationObserver !== 'undefined') {
      this._mutationObserver = new MutationObserver(() => {
        this._parent?._optionsContentChanges?.update(v => v + 1);
      });
      this._mutationObserver.observe(this.elementRef.nativeElement, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }
  }

  ngOnDestroy() {
    this._mutationObserver?.disconnect();
  }

  get selected(): boolean {
    return this.selectedInput() || this._selected();
  }

  get multiple(): boolean {
    return this._parent?.multiple() ?? false;
  }

  get hideCheckIcon(): boolean {
    return this._parent?.hideCheckIcon?.() ?? false;
  }

  get active(): boolean {
    return this._active();
  }

  select(): void {
    if (!this._selected()) {
      this._selected.set(true);
      this._cdr.markForCheck();
    }
  }

  deselect(): void {
    if (this._selected()) {
      this._selected.set(false);
      this._cdr.markForCheck();
    }
  }

  setActiveStyles(): void {
    this._active.set(true);
    this._cdr.markForCheck();
  }

  setInactiveStyles(): void {
    this._active.set(false);
    this._cdr.markForCheck();
  }

  _onClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.onSelectionChange.emit(this);
  }

  get viewValue(): string {
    const element = this.elementRef.nativeElement;
    const textElement = element.querySelector('.ngs-option-text');

    if (textElement) {
      return (textElement.textContent || '').trim();
    }

    return (element.textContent || '').trim();
  }

  getLabel?(): string {
    return this.viewValue;
  }
}
