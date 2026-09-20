import { Component, ChangeDetectionStrategy } from '@angular/core';
import {VisualBuilder} from "@ngstarter-ui/components/visual-builder";

@Component({
  selector: 'app-basic-example',
  imports: [
    VisualBuilder
  ],
  templateUrl: './basic-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-example.scss',
})
export class BasicExample {

}
