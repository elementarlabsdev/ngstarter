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
