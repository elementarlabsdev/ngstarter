import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicTreeExample } from '../_examples/basic-tree-example/basic-tree-example';
import { CheckableTreeExample } from '../_examples/checkable-tree-example/checkable-tree-example';
import { SelectableTreeExample } from '../_examples/selectable-tree-example/selectable-tree-example';
import {
  TreeWithDynamicDataExample
} from '../_examples/tree-with-dynamic-data-example/tree-with-dynamic-data-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicTreeExample,
    SelectableTreeExample,
    CheckableTreeExample,
    TreeWithDynamicDataExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
