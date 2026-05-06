import { PopoverTemplateRefExample } from '../_examples/popover-template-ref-example/popover-template-ref-example';
import { Component } from '@angular/core';
import { BasicPopoverExample } from '../_examples/basic-popover-example/basic-popover-example';
import { Playground } from '@meta/playground/playground';
import { PopoverHoverExample } from '../_examples/popover-hover-example/popover-hover-example';
import {
  PopoverWithCustomPositionExample
} from '../_examples/popover-with-custom-position-example/popover-with-custom-position-example';
import { PopoverLazyContentExample } from '../_examples/popover-lazy-content-example/popover-lazy-content-example';

@Component({
    selector: 'app-overview',
  imports: [
    Playground,
    BasicPopoverExample,
    PopoverHoverExample,
    PopoverWithCustomPositionExample,
    PopoverLazyContentExample,
    PopoverTemplateRefExample,
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
