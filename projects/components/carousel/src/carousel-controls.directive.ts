import { Directive } from '@angular/core';

@Directive({
  selector: '[ngsCarouselControls]',
  host: {
    'class': 'ngs-carousel-controls',
  }
})
export class CarouselControlsDirective {

}
