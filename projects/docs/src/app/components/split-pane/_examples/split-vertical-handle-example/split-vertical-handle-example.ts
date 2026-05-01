import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Split, SplitPane } from '@ngstarter-ui/components/split';

@Component({
  selector: 'app-split-vertical-handle-example',
  standalone: true,
  imports: [Split, SplitPane],
  templateUrl: './split-vertical-handle-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitVerticalHandleExample {}
