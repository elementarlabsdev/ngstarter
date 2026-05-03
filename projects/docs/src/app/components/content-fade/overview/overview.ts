import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicContentFadeExample
} from '../_examples/basic-content-fade-example/basic-content-fade-example';
import {
  ContentFadeCustomWidthExample
} from '../_examples/content-fade-custom-width-example/content-fade-custom-width-example';
import {
  ContentFadeCustomPositionExample
} from '../_examples/content-fade-custom-position-example/content-fade-custom-position-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicContentFadeExample,
    ContentFadeCustomWidthExample,
    ContentFadeCustomPositionExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
