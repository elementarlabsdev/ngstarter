import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicCardOverlayExample
} from '../_examples/basic-card-overlay-example/basic-card-overlay-example';
import {
  CardOverlayWithTranslateExample
} from '../_examples/card-overlay-with-translate-example/card-overlay-with-translate-example';
import {
  CardOverlayWithBlurExample
} from '../_examples/card-overlay-with-blur-example/card-overlay-with-blur-example';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    Playground,
    BasicCardOverlayExample,
    CardOverlayWithTranslateExample,
    CardOverlayWithBlurExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
