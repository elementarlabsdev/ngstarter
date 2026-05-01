import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { DataViewColumnSettingsExample } from '../_examples/data-view-column-settings-example/data-view-column-settings-example';

@Component({
  selector: 'app-column-settings',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    DataViewColumnSettingsExample
  ],
  templateUrl: './column-settings.html',
  styleUrl: './column-settings.scss'
})
export class DataViewColumnSettings {
}
