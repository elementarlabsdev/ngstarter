import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicConfirmExample } from '../_examples/basic-confirm-example/basic-confirm-example';
import {
  ConfirmFormModalExample
} from '../_examples/confirm-form-modal-example/confirm-form-modal-example';

@Component({
  imports: [
    Playground,
    BasicConfirmExample,
    ConfirmFormModalExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
