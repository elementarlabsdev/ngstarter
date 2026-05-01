import { Directive } from '@angular/core';

@Directive({
  selector: '[ngsCarouselControls]',
  standalone: true,
  host: {
    'class': 'ngs-carousel-controls',
  }
})
export class CarouselControlsDirective {

}
