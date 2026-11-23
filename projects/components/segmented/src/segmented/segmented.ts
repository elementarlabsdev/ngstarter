import {
  AfterContentInit,
  booleanAttribute,
  ChangeDetectorRef,
  Component, effect,
  ElementRef,
  forwardRef,
  inject, input,
  OnChanges,
  OnInit, model, output,
  Renderer2, SimpleChanges,
  contentChildren,
  Signal,
  DestroyRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormValueControl } from '@angular/forms/signals';
import { SegmentedTriggerSize, SEGMENTED } from '../types';
import { SegmentedButton } from '../segmented-button/segmented-button';

@Component({
  selector: 'ngs-segmented',
  exportAs: 'ngsSegmented',
  templateUrl: './segmented.html',
  styleUrl: './segmented.scss',
  providers: [
    {
      provide: SEGMENTED,
      useExisting: forwardRef(() => Segmented)
    }
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    '(focusout)': 'onFocusOut($event)',
    '[attr.aria-readonly]': 'readonly() || null',
    'class': 'ngs-segmented',
    '[class.is-disabled]': 'disabled()',
    '(window:resize)': '_onResize()',
  },
})
export class Segmented implements OnInit, OnChanges, AfterContentInit, FormValueControl<any> {
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly touch = output<void>();

  protected onFocusOut(event: FocusEvent): void {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
      this.touch.emit();
    }
  }

  private _elementRef = inject(ElementRef);
  private _renderer = inject(Renderer2);
  private _cdr = inject(ChangeDetectorRef);
  private _destroyRef = inject(DestroyRef);
  private _isDestroyed = false;

  readonly _buttons = contentChildren(forwardRef(() => SegmentedButton), { descendants: true });

  readonly _buttonElements = contentChildren(forwardRef(() => SegmentedButton), { read: ElementRef, descendants: true });

  _thumbWidth = 0;
  _thumbLeft = 0;
  _thumbOpacity = 0;

  readonly value = model<any>(null);
  disabled = input(false, {
    transform: booleanAttribute
  });
  size = input<SegmentedTriggerSize>('default');

  get api() {
    return {
      isSelected: (value: any) => this.isSelected(value),
      select: (value: any) => this._select(value)
    };
  }

  constructor() {
    this._destroyRef.onDestroy(() => {
      this._isDestroyed = true;
    });

    effect(() => {
      this.value();
      this._updateThumb();
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

  private _select(value: any): void {
    if (!this.disabled() && !this.readonly()) {
      this.value.set(value);
    }
  }

  isSelected(value: any): boolean {
    return this.value() != null && Object.is(this.value(), value);
  }
}
