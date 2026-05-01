import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { Playground } from '@meta/playground/playground';
import {
  BasicImageResizerExample
} from '../_examples/basic-image-resizer-example/basic-image-resizer-example';
import { Tab, TabGroup } from '@ngstarter-ui/components/tabs';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    Page,
    PageContentDirective,
    Playground,
    BasicImageResizerExample,
    Tab,
    TabGroup,
    PageTitleDirective
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
