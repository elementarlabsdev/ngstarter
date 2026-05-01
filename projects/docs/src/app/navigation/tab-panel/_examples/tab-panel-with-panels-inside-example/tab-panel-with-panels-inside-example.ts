import { Component } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import {
  TabPanelAside,
  TabPanelAsideContentDirective, TabPanelContent, TabPanel,
  TabPanelItem,
  TabPanelItemIconDirective,
  TabPanelItemText, TabPanelNav
} from '@ngstarter/components/tab-panel';
import {
  PanelContent,
  Panel,
  PanelFooter,
  PanelHeader
} from '@ngstarter/components/panel';

@Component({
  selector: 'app-tab-panel-with-panels-inside-example',
  imports: [
    Icon,
    TabPanelItemIconDirective,
    TabPanelItemText,
    TabPanelItem,
    TabPanelAsideContentDirective,
    PanelHeader,
    PanelContent,
    PanelFooter,
    Panel,
    TabPanelAside,
    TabPanelNav,
    TabPanelContent,
    TabPanel
  ],
  templateUrl: './tab-panel-with-panels-inside-example.html',
  styleUrl: './tab-panel-with-panels-inside-example.scss'
})
export class TabPanelWithPanelsInsideExample {

}
