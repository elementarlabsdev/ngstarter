import { Component, ElementRef, inject } from '@angular/core';
import { CAROUSEL_CARD } from '../types';

@Component({
  selector: 'ngs-carousel-card,[ngs-carousel-card]',
  exportAs: 'ngsCarouselCard',
  imports: [],
  providers: [
    {
      provide: CAROUSEL_CARD,
      useExisting: CarouselCard
    }
  ],
  templateUrl: './carousel-card.html',
  styleUrl: './carousel-card.scss',
  host: {
    'class': 'ngs-carousel-card',
  }
})
export class CarouselCard {
  private _elementRef = inject(ElementRef);

  get element(): HTMLElement {
    return this._elementRef.nativeElement;
  }
}
