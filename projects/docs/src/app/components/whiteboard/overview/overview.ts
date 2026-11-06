import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicWhiteboardExample } from '../_examples/basic-whiteboard-example/basic-whiteboard-example';

@Component({
  imports: [Playground, BasicWhiteboardExample],
  templateUrl: './overview.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Overview {}
