import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicDrawerExample } from '../_examples/basic-drawer-example/basic-drawer-example';
import {
  DrawerWithoutBackdropExample
} from '../_examples/drawer-without-backdrop-example/drawer-without-backdrop-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicDrawerExample,
    DrawerWithoutBackdropExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
