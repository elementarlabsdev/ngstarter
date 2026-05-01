import { Component } from '@angular/core';
import { Tab, TabGroup } from '@ngstarter-ui/components/tabs';

@Component({
    selector: 'app-paginated-tabs-example',
  imports: [
    TabGroup,
    Tab
  ],
    templateUrl: './paginated-tabs-example.html',
    styleUrl: './paginated-tabs-example.scss'
})
export class PaginatedTabsExample {
  lotsOfTabs = new Array(30).fill(0).map((_, index) => `Tab ${index}`);
}
