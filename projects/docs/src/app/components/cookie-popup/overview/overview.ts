import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicCookiePopupExample
} from '../_examples/basic-cookie-popup-example/basic-cookie-popup-example';

@Component({
  imports: [
    Playground,
    BasicCookiePopupExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
