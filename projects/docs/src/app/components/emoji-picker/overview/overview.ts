import { Component } from '@angular/core';
import { PageContentDirective } from '@meta/page/page-content.directive';
import {
  BasicEmojiPickerExample
} from '../_examples/basic-emoji-picker-example/basic-emoji-picker-example';
import { Playground } from '@meta/playground/playground';
import { Page } from '@meta/page/page';
import { Tab, TabGroup } from '@ngstarter/components/tabs';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  selector: 'app-overview',
  imports: [
    PageContentDirective,
    BasicEmojiPickerExample,
    Playground,
    Page,
    Tab,
    TabGroup,
    PageTitleDirective
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
