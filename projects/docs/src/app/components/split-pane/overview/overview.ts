import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicSplitExample } from '../_examples/basic-split-example/basic-split-example';
import { SplitHandleExample } from '../_examples/split-handle-example/split-handle-example';
import { SplitVerticalHandleExample } from '../_examples/split-vertical-handle-example/split-vertical-handle-example';
import { SplitMinMaxExample } from '../_examples/split-min-max-example/split-min-max-example';
import { SplitRestrictMoveExample } from '../_examples/split-restrict-move-example/split-restrict-move-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicSplitExample,
    SplitHandleExample,
    SplitVerticalHandleExample,
    SplitMinMaxExample,
    SplitRestrictMoveExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {

}
