import {
  AfterContentInit,
  booleanAttribute,
  ChangeDetectorRef,
  Component, effect,
  ElementRef,
  forwardRef,
  inject, input,
  OnChanges,
  OnInit, output,
  Renderer2, SimpleChanges,
  contentChildren,
  Signal,
  DestroyRef
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SegmentedTriggerSize, SEGMENTED } from '../types';
import { SelectionModel } from '@angular/cdk/collections';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { SegmentedButton } from '../segmented-button/segmented-button';

@Component({
  selector: 'ngs-segmented',
  exportAs: 'ngsSegmented',
  templateUrl: './segmented.html',
  styleUrl: './segmented.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Segmented),
      multi: true
    },
    {
      provide: SEGMENTED,
      useExisting: forwardRef(() => Segmented)
    }
  ],
  host: {
    'class': 'ngs-segmented',
    '[class.is-disabled]': 'disabled() || _disabled || null',
    '(window:resize)': '_onResize()',
  },
})
export class Segmented implements OnInit, OnChanges, AfterContentInit, ControlValueAccessor {
  private _elementRef = inject(ElementRef);
  private _renderer = inject(Renderer2);
  private _cdr = inject(ChangeDetectorRef);
  private _destroyRef = inject(DestroyRef);
  private _isDestroyed = false;
  protected _disabled = false;

  readonly _buttons = contentChildren(forwardRef(() => SegmentedButton), { descendants: true });

  readonly _buttonElements = contentChildren(forwardRef(() => SegmentedButton), { read: ElementRef, descendants: true });

  _thumbWidth = 0;
  _thumbLeft = 0;
  _thumbOpacity = 0;

  value = input();
  disabled = input(false, {
    transform: booleanAttribute
  });
  size = input<SegmentedTriggerSize>('default');

  readonly valueChange = output<any>();

  private _selectedValue = new SelectionModel<any>(false, []);

  _onChange: any = () => {};
  _onTouched: any = () => {};

  get api() {
    return {
      isSelected: (value: any) => this._selectedValue.isSelected(value),
      select: (value: any) => this._select(value)
    };
  }

  constructor() {
    this._destroyRef.onDestroy(() => {
      this._isDestroyed = true;
    });

    effect(() => {
      const value = this.value();
      if (value !== undefined) {
        if (value !== null) {
          this._selectedValue.setSelection(value);
        } else {
          this._selectedValue.clear();
        }
        this._updateThumb();
      }
    });

    toObservable(this._buttons).pipe(takeUntilDestroyed()).subscribe(() => {
      this._updateThumb();
    });
  }

  ngOnInit() {
    this._renderer.setAttribute(this._elementRef.nativeElement, 'ngs-segmented-size', this.size());
  }

  ngAfterContentInit() {
    this._updateThumb();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['size']) {
      this._renderer.setAttribute(this._elementRef.nativeElement, 'ngs-segmented-size', this.size());
      this._updateThumb();
    }

    if (changes['value'] && changes['value'].currentValue !== undefined) {
      const value = changes['value'].currentValue;
      if (value !== null) {
        this._selectedValue.setSelection(value);
      } else {
        this._selectedValue.clear();
      }
      this._updateThumb();
    }
  }

  _onResize() {
    this._updateThumb();
  }

  private _updateThumb() {
    setTimeout(() => {
      const buttons = this._buttons();
      if (!buttons) {
        return;
      }
      const index = buttons.findIndex(btn => btn._isSelected);
      const element = this._buttonElements()[index]?.nativeElement;

      if (element) {
        this._thumbWidth = element.offsetWidth;
        this._thumbLeft = element.offsetLeft;
        this._thumbOpacity = 1;
      } else {
        this._thumbWidth = 0;
        this._thumbOpacity = 0;
      }
      if (this._isDestroyed) {
        return;
      }
      this._cdr.detectChanges();
    });
  }

  writeValue(value: any): void {
    if (value !== undefined && value !== null) {
      this._selectedValue.setSelection(value);
    } else {
      this._selectedValue.clear();
    }
    this._updateThumb();
    this._cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: BooleanInput): void {
    this._disabled = coerceBooleanProperty(isDisabled);
  }

  private _select(value: any): void {
    this._selectedValue.setSelection(value);
    this.valueChange.emit(value);
    this._onChange(value);
    this._onTouched(value);
    this._updateThumb();
  }

  isSelected(value: any): boolean {
    return this._selectedValue.isSelected(value);
  }
}
