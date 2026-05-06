import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicKbdExample } from '../_examples/basic-kbd-example/basic-kbd-example';
import { KbdGroupExample } from '../_examples/kbd-group-example/kbd-group-example';
import { KbdWithMenuExample } from '../_examples/kbd-with-menu-example/kbd-with-menu-example';

@Component({
  imports: [
    Playground,
    BasicKbdExample,
    KbdGroupExample,
    KbdWithMenuExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {

}
