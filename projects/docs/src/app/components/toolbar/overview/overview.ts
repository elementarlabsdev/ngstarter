import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicToolbarExample } from '../_examples/basic-toolbar-example/basic-toolbar-example';
import { MultiRowToolbarExample } from '../_examples/multi-row-toolbar-example/multi-row-toolbar-example';
import { ToolbarWithItemsExample } from '../_examples/toolbar-with-items-example/toolbar-with-items-example';
import { ToolbarOverflowExample } from '../_examples/toolbar-overflow-example/toolbar-overflow-example';
import {ToolbarNavExample} from "../_examples/toolbar-nav-example/toolbar-nav-example";

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicToolbarExample,
    MultiRowToolbarExample,
    ToolbarWithItemsExample,
    ToolbarOverflowExample,
    ToolbarNavExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {}
