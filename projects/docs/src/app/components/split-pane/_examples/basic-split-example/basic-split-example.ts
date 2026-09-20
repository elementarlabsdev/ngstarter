import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Split, SplitPane } from '@ngstarter-ui/components/split';

@Component({
  selector: 'app-basic-split-example',
  imports: [
    SplitPane,
    Split
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './basic-split-example.html',
})
export class BasicSplitExample {

}
