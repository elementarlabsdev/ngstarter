import {
  AfterContentInit,
  ChangeDetectorRef, DestroyRef,
  Directive,
  forwardRef,
  inject,
  OnInit,
  contentChildren, signal, Signal, input, booleanAttribute, computed,
  output, model, effect, untracked
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { SelectionModel } from '@angular/cdk/collections';
import { merge, Observable, startWith, switchMap } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { Option, SELECT } from '@ngstarter-ui/components/select';
import { OptionParentComponent, OPTION_PARENT_COMPONENT } from './option-parent';
import { Menu } from './menu/menu';

@Directive({
  selector: '[ngsMenuOptionGroup]',
  standalone: true,
  host: {
    '(focusout)': 'onFocusOut($event)',
  },
  providers: [
    {
      provide: OPTION_PARENT_COMPONENT,
      useExisting: MenuOptionGroupDirective
    },
    {
      provide: SELECT,
      useFactory: (directive: MenuOptionGroupDirective) => {
        return {
          multiple: directive.multipleSignal,
          hideCheckIcon: directive.hideCheckIcon,
          _optionsContentChanges: directive._optionsContentChanges
        };
      },
      deps: [forwardRef(() => MenuOptionGroupDirective)]
    }
  ]
})
export class MenuOptionGroupDirective implements OptionParentComponent, OnInit, FormValueControl<any>, AfterContentInit {
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _destroyRef = inject(DestroyRef);
  private _menu = inject(Menu, { optional: true });

  disableRipple = false;
  inertGroups = false;
  hideSingleSelectionIndicator = false;

  multiple = input(false, { transform: booleanAttribute });
  readonly multipleSignal: Signal<boolean> = computed(() => this.multiple());
  readonly hideCheckIcon = signal(false);
  readonly _optionsContentChanges = signal(0);

  _selectionModel: SelectionModel<any>;
  readonly value = model<any>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly touch = output<void>();

  readonly options = contentChildren(Option, { descendants: true });
  readonly ngsOptions = this.options;

  readonly optionSelectionChanges: Observable<any> = toObservable(this.options).pipe(
    startWith(null),
    switchMap(() => merge(...this.options().map(option => outputToObservable(option.onSelectionChange))))
  );

  constructor() {
    effect(() => this._selectOptionByValue());
  }

  protected onFocusOut(event: FocusEvent): void {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
      this.touch.emit();
    }
  }

  ngOnInit() {
    this._selectionModel = new SelectionModel<any>(this.multiple());
  }

  ngAfterContentInit() {
    this.optionSelectionChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res: any) => {
        if (this.disabled() || this.readonly()) {
          this._selectOptionByValue();
          return;
        }
        const source = res?.source ?? res;
        this.value.set(typeof source.value === 'function' ? source.value() : source.value);
        this._selectOptionByValue();

        if (!this.multiple()) {
          this._menu?.close('click');
        }
      });
  }

  private _selectOptionByValue() {
    const value = this.value();
    for (const option of this.options()) {
      const selected = option.value() === value;
      untracked(() => {
        if (selected) {
          option.select();
        } else {
          option.deselect();
        }
      });
    }
    this._changeDetectorRef.markForCheck();
  }
}
