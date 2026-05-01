import { Component } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  TabPanelAside,
  TabPanelAsideContentDirective, TabPanelContent, TabPanel,
  TabPanelItem,
  TabPanelItemIconDirective,
  TabPanelItemText, TabPanelNav
} from '@ngstarter-ui/components/tab-panel';

@Component({
  selector: 'app-basic-tab-panel-example',
  imports: [
    Icon,
    TabPanelItemIconDirective,
    TabPanelItem,
    TabPanelItemText,
    TabPanelAsideContentDirective,
    TabPanelAside,
    TabPanelNav,
    TabPanelContent,
    TabPanel
  ],
  templateUrl: './basic-tab-panel-example.html',
  styleUrl: './basic-tab-panel-example.scss'
})
export class BasicTabPanelExample {

}
