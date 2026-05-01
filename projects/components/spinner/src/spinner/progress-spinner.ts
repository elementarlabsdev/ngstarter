import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  NgModule,
  numberAttribute,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export type SpinnerMode = 'determinate' | 'indeterminate';

const BASE_SIZE = 100;
const BASE_STROKE_WIDTH = 10;

@Component({
  selector: 'ngs-progress-spinner',
  exportAs: 'ngsProgressSpinner',
  host: {
    'role': 'progressbar',
    'class': 'ngs-progress-spinner',
    'tabindex': '-1',
    '[class.mdc-circular-progress--indeterminate]': 'mode() === "indeterminate"',
    '[class.ngs-progress-spinner-indeterminate]': 'mode() === "indeterminate"',
    '[class.ngs-progress-spinner-determinate]': 'mode() === "determinate"',
    '[style.width.px]': 'diameter()',
    '[style.height.px]': 'diameter()',
    '[style.--ngs-progress-spinner-size]': 'diameter() + "px"',
    '[style.--ngs-progress-spinner-active-indicator-width]': 'diameter() + "px"',
    '[class]': '"ngs-" + color()',
    '[attr.aria-valuemin]': '0',
    '[attr.aria-valuemax]': '100',
    '[attr.aria-valuenow]': 'mode() === "determinate" ? value() : null',
    '[attr.mode]': 'mode()',
  },
  templateUrl: './progress-spinner.html',
  styleUrl: './progress-spinner.scss',
  standalone: true,
  imports: [NgTemplateOutlet]
})
export class ProgressSpinner {
  readonly color = input<string>('primary');
  readonly mode = input<SpinnerMode>('indeterminate');
  readonly value = input(0, { transform: numberAttribute });
  readonly diameter = input(100, { transform: numberAttribute });
  readonly strokeWidth = input<number | undefined, unknown>(undefined, { transform: numberAttribute });

  public readonly _elementRef = inject(ElementRef);

  readonly _actualStrokeWidth = computed(() => this.strokeWidth() || this.diameter() / 10);

  _circleRadius() {
    return (this.diameter() - BASE_STROKE_WIDTH) / 2;
  }

  _viewBox() {
    const viewBox = this._circleRadius() * 2 + this._actualStrokeWidth();
    return `0 0 ${viewBox} ${viewBox}`;
  }

  _strokeCircumference() {
    return 2 * Math.PI * this._circleRadius();
  }

  _strokeDashOffset() {
    if (this.mode() === 'determinate') {
      return (this._strokeCircumference() * (100 - this.value())) / 100;
    }
    return null;
  }

  _circleStrokeWidth() {
    return (this._actualStrokeWidth() / this.diameter()) * 100;
  }
}

@NgModule({
  imports: [ProgressSpinner],
  exports: [ProgressSpinner],
})
export class ProgressSpinnerModule {}
