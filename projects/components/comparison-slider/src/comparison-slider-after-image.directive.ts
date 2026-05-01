import { Directive } from '@angular/core';

@Directive({
  selector: '[ngsComparisonSliderAfterImage]',
  host: {
    '(dragstart)': 'onDragStart($event)'
  }
})
export class ComparisonSliderAfterImageDirective {
  protected onDragStart(event: DragEvent) {
    event.preventDefault();
  }
}
