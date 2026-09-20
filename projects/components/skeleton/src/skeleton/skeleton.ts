import { booleanAttribute, Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-skeleton',
  exportAs: 'ngsSkeleton',
  imports: [],
  template: '',
  styleUrl: './skeleton.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    class: 'ngs-skeleton',
    '[class.rounded-full]': 'roundedFull'
  }
})
export class Skeleton {
  roundedFull = input(false, {
    transform: booleanAttribute
  });
}
