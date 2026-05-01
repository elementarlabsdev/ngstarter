import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { Playground } from '@meta/playground/playground';
import {
  BasicTextEditorExample
} from '../_examples/basic-text-editor-example/basic-text-editor-example';
import {
  TextEditorFloatingMenuExample
} from '../_examples/text-editor-floating-menu-example/text-editor-floating-menu-example';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  selector: 'app-overview',
  imports: [
    Page,
    PageContentDirective,
    Playground,
    BasicTextEditorExample,
    TextEditorFloatingMenuExample,
    PageTitleDirective
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
