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
  selector: 'app-carousel-fade-effect-example',
  imports: [
    CarouselCard,
    Carousel,
    CarouselNextDirective,
    CarouselPreviousDirective,
    Icon,
    Button,

  ],
  templateUrl: './carousel-fade-effect-example.html',
  styleUrl: './carousel-fade-effect-example.scss'
})
export class CarouselFadeEffectExample {

}
