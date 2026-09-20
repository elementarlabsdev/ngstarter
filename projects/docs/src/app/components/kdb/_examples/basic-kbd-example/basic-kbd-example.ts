import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Kbd } from '@ngstarter-ui/components/kbd';

@Component({
  selector: 'app-basic-kbd-example',
  imports: [
    Kbd
  ],
  templateUrl: './basic-kbd-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-kbd-example.scss',
})
export class BasicKbdExample {

}
