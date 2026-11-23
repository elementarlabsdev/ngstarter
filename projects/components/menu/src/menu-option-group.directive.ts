import {
  AfterContentInit,
  ChangeDetectorRef, DestroyRef,
  Directive,
  forwardRef,
  inject,
  OnInit,
  contentChildren, signal, Signal, input, booleanAttribute, computed,
  output, model, effect
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { SelectionModel } from '@angular/cdk/collections';
import { defer, merge, Observable, Subject, switchMap, EMPTY, map, startWith } from 'rxjs';
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
  readonly ngsOptions = contentChildren(forwardRef(() => Option), { descendants: true });

  private _options$ = toObservable(this.options);
  private _ngsOptions$ = toObservable(this.ngsOptions);

  private _initialized = new Subject();


  readonly optionSelectionChanges: Observable<any> = merge(
    this._options$,
    this._ngsOptions$
  ).pipe(
    startWith(null),
    switchMap(() => {
      const options = this.options();
      const ngsOptions = this.ngsOptions();
      const streams = [
        ...options.map(option => outputToObservable(option.onSelectionChange) as Observable<any>),
        ...ngsOptions.map(option => outputToObservable(option.onSelectionChange) as Observable<any>)
      ];

      if (streams.length === 0) {
        return EMPTY;
      }

      return merge(...streams);
    })
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
      })
    ;

    this._options$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._selectOptionByValue();
      });

    this._ngsOptions$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._selectOptionByValue();
      });
  }

  private _selectOptionByValue() {
    const options = this.options();
    const ngsOptions = this.ngsOptions();

    options.forEach(option => {
      if (option.value === this.value()) {
        option.select();
      } else {
        option.deselect();
      }
    });

    ngsOptions.forEach(option => {
      if (option.value() === this.value()) {
        option.select();
      } else {
        option.deselect();
      }
    });
    this._changeDetectorRef.markForCheck();
  }


}
