import { Directive, inject, input, OnInit } from '@angular/core';
import { CAROUSEL, CarouselInterface } from './types';

@Directive({
  selector: '[ngsCarouselNext]',
  exportAs: 'ngsCarouselNext',
  standalone: true,
  host: {
    'class': 'ngs-carousel-next',
    '[attr.disabled]': '_carousel?.api?.isNextDisabled() ? true : null',
    '(click)': '_handleClick()'
  }
})
export class CarouselNextDirective implements OnInit {
  protected _carousel = inject<CarouselInterface>(CAROUSEL, {
    optional: true
  });

  carousel = input<CarouselInterface | null>(null);

  ngOnInit(): void {
    if (this.carousel() && !this._carousel) {
      this._carousel = this.carousel();
    }
  }

  _handleClick(): void {
    this._carousel?.api.next();
  }
}
