import { Component } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import {
  CarouselCard,
  Carousel,
  CarouselNextDirective,
  CarouselPreviousDirective
} from '@ngstarter/components/carousel';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'app-carousel-controls-custom-position-example',
  imports: [
    CarouselCard,
    Carousel,
    CarouselNextDirective,
    CarouselPreviousDirective,
    Icon,
    Button,

  ],
  templateUrl: './carousel-controls-custom-position-example.html',
  styleUrl: './carousel-controls-custom-position-example.scss'
})
export class CarouselControlsCustomPositionExample {

}
