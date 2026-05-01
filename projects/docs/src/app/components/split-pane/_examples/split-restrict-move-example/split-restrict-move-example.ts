import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Split, SplitPane } from '@ngstarter/components/split';

@Component({
  selector: 'app-split-restrict-move-example',
  standalone: true,
  imports: [Split, SplitPane],
  templateUrl: './split-restrict-move-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitRestrictMoveExample {}
