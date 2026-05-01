import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicExpansionPanelExample
} from '../_examples/basic-expansion-panel-example/basic-expansion-panel-example';
import {
  ExpansionPanelExpandCollapseTogglesExample
} from '../_examples/expansion-panel-expand-collapse-toggles-example/expansion-panel-expand-collapse-toggles-example';
import {
  ExpansionPanelAsAccordionExample
} from '../_examples/expansion-panel-as-accordion-example/expansion-panel-as-accordion-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
    selector: 'app-overview',
  imports: [
    Playground,
    BasicExpansionPanelExample,
    ExpansionPanelExpandCollapseTogglesExample,
    ExpansionPanelAsAccordionExample,
    Page,
    PageContentDirective,
    PageTitleDirective
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
