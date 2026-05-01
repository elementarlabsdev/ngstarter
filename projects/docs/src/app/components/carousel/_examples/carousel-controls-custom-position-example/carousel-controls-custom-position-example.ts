import { Component } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  CarouselCard,
  Carousel,
  CarouselNextDirective,
  CarouselPreviousDirective
} from '@ngstarter-ui/components/carousel';
import { Button } from '@ngstarter-ui/components/button';

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
