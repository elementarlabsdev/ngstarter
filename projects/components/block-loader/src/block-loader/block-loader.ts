import { booleanAttribute, ChangeDetectionStrategy, Component, input, numberAttribute } from '@angular/core';
import { ProgressSpinner } from '@ngstarter/components/spinner';

@Component({
  selector: 'ngs-block-loader',
  exportAs: 'ngsBlockLoader',
  imports: [
    ProgressSpinner
  ],
  templateUrl: './block-loader.html',
  styleUrl: './block-loader.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-block-loader',
    '[class.is-loading]': 'loading()'
  }
})
export class BlockLoader {
  readonly loading = input(false, {
    transform: booleanAttribute
  });
  readonly spinnerDiameter = input(48, {
    transform: numberAttribute
  });
  readonly spinnerStrokeWidth = input(4, {
    transform: numberAttribute
  });
}
