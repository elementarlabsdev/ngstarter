import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  AfterViewInit,
  OnDestroy,
  inject,
  ElementRef,
  NgZone,
  Renderer2,
  numberAttribute,
  output
} from '@angular/core';

export type ProgressBarMode = 'determinate' | 'indeterminate' | 'buffer' | 'query';

@Component({
  selector: 'ngs-progress-bar',
  exportAs: 'ngsProgressBar',
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'role': 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    'tabindex': '-1',
    '[attr.aria-valuenow]': 'isIndeterminate() ? null : value()',
    '[attr.mode]': 'mode()',
    'class': 'ngs-progress-bar',
    '[class.ngs-progress-bar-indeterminate]': 'isIndeterminate()',
    '[style.--ngs-progress-bar-value]': 'value()',
    '[style.--ngs-progress-bar-buffer-value]': 'bufferValue()',
  },
})
export class ProgressBar implements AfterViewInit, OnDestroy {
  private readonly _elementRef = inject(ElementRef);
  private readonly _ngZone = inject(NgZone);
  private readonly _renderer = inject(Renderer2);

  readonly color = input<string>('primary');
  readonly value = input(0, { transform: numberAttribute });
  readonly bufferValue = input(0, { transform: numberAttribute });
  readonly mode = input<ProgressBarMode>('determinate');

  readonly animationEnd = output<{
    value: number;
  }>();

  private _cleanupTransitionEnd?: () => void;

  readonly isIndeterminate = computed(() => {
    return this.mode() === 'indeterminate' || this.mode() === 'query';
  });

  readonly primaryBarTransform = computed(() => {
    return `scaleX(${this.isIndeterminate() ? 1 : this.value() / 100})`;
  });

  readonly bufferBarTransform = computed(() => {
    return `scaleX(${this.mode() === 'buffer' ? this.bufferValue() / 100 : 1})`;
  });

  /** @deprecated use bufferBarTransform instead */
  readonly bufferBarFlexBasis = computed(() => {
    return this.bufferBarTransform();
  });

  ngAfterViewInit() {
    this._ngZone.runOutsideAngular(() => {
      this._cleanupTransitionEnd = this._renderer.listen(
        this._elementRef.nativeElement,
        'transitionend',
        this._transitionendHandler
      );
    });
  }

  ngOnDestroy() {
    this._cleanupTransitionEnd?.();
  }

  private _transitionendHandler = (event: TransitionEvent) => {
    if (
      !event.target ||
      !(event.target as HTMLElement).classList.contains('ngs-progress-bar-primary-bar')
    ) {
      return;
    }

    if (this.mode() === 'determinate' || this.mode() === 'buffer') {
      this._ngZone.run(() => this.animationEnd.emit({ value: this.value() }));
    }
  };
}
