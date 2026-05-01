import {
  AfterContentInit,
  ChangeDetectorRef, DestroyRef,
  Directive,
  forwardRef,
  inject,
  OnInit,
  contentChildren, signal, Signal, input, booleanAttribute, computed,
  output
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
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
  providers: [
    {
      provide: OPTION_PARENT_COMPONENT,
      useExisting: MenuOptionGroupDirective
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MenuOptionGroupDirective),
      multi: true
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
export class MenuOptionGroupDirective implements OptionParentComponent, OnInit, ControlValueAccessor, AfterContentInit {
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
  private _value: any;

  readonly options = contentChildren(Option, { descendants: true });
  readonly ngsOptions = contentChildren(forwardRef(() => Option), { descendants: true });

  private _options$ = toObservable(this.options);
  private _ngsOptions$ = toObservable(this.ngsOptions);

  private _initialized = new Subject();

  readonly valueChange = output<any>();

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

  onChange: any = () => {};
  onTouched: any = () => {};

  ngOnInit() {
    this._selectionModel = new SelectionModel<any>(this.multiple());
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  ngAfterContentInit() {
    this.optionSelectionChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res: any) => {
        let source: any;

        if (res instanceof Option) {
          source = res;
        } else if (res && res.source instanceof Option) {
          source = res.source;
        } else {
          source = res;
        }

        if (source instanceof Option) {
          this._value = source.value();
        } else if (source && typeof source.value === 'function') {
          this._value = source.value();
        } else {
          this._value = source.value;
        }
        this._selectOptionByValue();
        this.onChange(this._value);

        if (!this.multiple) {
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
      if (option.value === this._value) {
        option.select();
      } else {
        option.deselect();
      }
    });

    ngsOptions.forEach(option => {
      if (option.value() === this._value) {
        option.select();
      } else {
        option.deselect();
      }
    });
    this._changeDetectorRef.markForCheck();
  }

  writeValue(newValue: any): void {
    if (newValue !== this._value) {
      this._value = newValue;
      this._selectOptionByValue();
    }
  }
}
