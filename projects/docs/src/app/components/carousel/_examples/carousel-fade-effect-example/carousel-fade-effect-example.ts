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
