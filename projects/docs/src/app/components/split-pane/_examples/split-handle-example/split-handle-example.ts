import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Split, SplitPane } from '@ngstarter-ui/components/split';

@Component({
  selector: 'app-split-handle-example',
  standalone: true,
  imports: [Split, SplitPane],
  templateUrl: './split-handle-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitHandleExample {}
