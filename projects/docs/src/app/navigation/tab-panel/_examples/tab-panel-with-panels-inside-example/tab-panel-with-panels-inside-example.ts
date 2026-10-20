import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  TabPanelAside,
  TabPanelAsideContentDirective, TabPanelContent, TabPanel,
  TabPanelItem,
  TabPanelItemIconDirective,
  TabPanelItemText, TabPanelNav
} from '@ngstarter-ui/components/tab-panel';
import {
  LayoutContent,
  Layout,
  LayoutFooter,
  LayoutHeader
} from '@ngstarter-ui/components/layout';

@Component({
  selector: 'app-tab-panel-with-panels-inside-example',
  imports: [
    Icon,
    TabPanelItemIconDirective,
    TabPanelItemText,
    TabPanelItem,
    TabPanelAsideContentDirective,
    LayoutHeader,
    LayoutContent,
    LayoutFooter,
    Layout,
    TabPanelAside,
    TabPanelNav,
    TabPanelContent,
    TabPanel
  ],
  templateUrl: './tab-panel-with-panels-inside-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './tab-panel-with-panels-inside-example.scss'
})
export class TabPanelWithPanelsInsideExample {

}
