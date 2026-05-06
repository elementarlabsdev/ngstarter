import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicTextEditorExample
} from '../_examples/basic-text-editor-example/basic-text-editor-example';
import {
  TextEditorFloatingMenuExample
} from '../_examples/text-editor-floating-menu-example/text-editor-floating-menu-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicTextEditorExample,
    TextEditorFloatingMenuExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
