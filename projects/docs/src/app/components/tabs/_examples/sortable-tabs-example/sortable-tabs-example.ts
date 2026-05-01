import { Component } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Tab, TabGroup, TabLabel } from '@ngstarter-ui/components/tabs';

@Component({
    selector: 'app-sortable-tabs-example',
  imports: [
    CdkDrag,
    CdkDropList,
    TabGroup,
    Tab,
    TabLabel
  ],
    templateUrl: './sortable-tabs-example.html',
    styleUrl: './sortable-tabs-example.scss'
})
export class SortableTabsExample {
  protected tabs = ['One', 'Two', 'Three', 'Four', 'Five'];
  protected selectedTabIndex = 0;

  drop(event: CdkDragDrop<string[]>) {
    const prevActive = this.tabs[this.selectedTabIndex];
    moveItemInArray(this.tabs, event.previousIndex, event.currentIndex);
    this.selectedTabIndex = this.tabs.indexOf(prevActive);
  }
}
