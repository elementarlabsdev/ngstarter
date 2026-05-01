import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Split, SplitPane } from '@ngstarter-ui/components/split';

@Component({
  selector: 'app-split-min-max-example',
  standalone: true,
  imports: [Split, SplitPane],
  templateUrl: './split-min-max-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitMinMaxExample {}
