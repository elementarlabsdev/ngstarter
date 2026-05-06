import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicMarqueeExample } from '../_examples/basic-marquee-example/basic-marquee-example';
import { MarqueeReverseExample } from '../_examples/marquee-reverse-example/marquee-reverse-example';
import {
  MarqueePauseOnHoverExample
} from '../_examples/marquee-pause-on-hover-example/marquee-pause-on-hover-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicMarqueeExample,
    MarqueeReverseExample,
    MarqueePauseOnHoverExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {
}
