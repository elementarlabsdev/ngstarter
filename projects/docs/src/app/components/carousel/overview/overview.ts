import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicCarouselExample } from '../_examples/basic-carousel-example/basic-carousel-example';
import {
  CarouselControlsCustomPositionExample
} from '../_examples/carousel-controls-custom-position-example/carousel-controls-custom-position-example';
import {
  CarouselFadeEffectExample
} from '../_examples/carousel-fade-effect-example/carousel-fade-effect-example';

@Component({
  imports: [
    Playground,
    BasicCarouselExample,
    CarouselControlsCustomPositionExample,
    CarouselFadeEffectExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {
}
