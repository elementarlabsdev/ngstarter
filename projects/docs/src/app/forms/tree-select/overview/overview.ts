import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicTreeSelectExample } from '../_examples/basic-tree-select-example/basic-tree-select-example';
import { MultipleTreeSelectExample } from '../_examples/multiple-tree-select-example/multiple-tree-select-example';
import { LazyTreeSelectExample } from '../_examples/lazy-tree-select-example/lazy-tree-select-example';
@Component({
  imports: [Playground, BasicTreeSelectExample, MultipleTreeSelectExample, LazyTreeSelectExample],
  templateUrl: './overview.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Overview {}
