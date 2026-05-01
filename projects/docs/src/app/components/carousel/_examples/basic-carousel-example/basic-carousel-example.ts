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
  selector: 'app-basic-carousel-example',
  imports: [
    Carousel,
    CarouselCard,
    Icon,
    CarouselPreviousDirective,
    CarouselNextDirective,
    Button,

  ],
  templateUrl: './basic-carousel-example.html',
  styleUrl: './basic-carousel-example.scss'
})
export class BasicCarouselExample {

}
