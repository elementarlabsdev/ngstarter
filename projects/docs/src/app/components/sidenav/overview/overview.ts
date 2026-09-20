import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicSidenavExample } from '../_examples/basic-sidenav-example/basic-sidenav-example';

@Component({
  imports: [
    Playground,
    BasicSidenavExample
  ],
  templateUrl: './overview.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './overview.scss'
})
export class Overview {

}
