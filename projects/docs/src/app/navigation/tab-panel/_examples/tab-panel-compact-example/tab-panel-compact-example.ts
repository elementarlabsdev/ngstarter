import { Component } from '@angular/core';
import { Tooltip } from '@ngstarter/components/tooltip';
import {
  TabPanelAside,
  TabPanelAsideContentDirective, TabPanelContent, TabPanel,
  TabPanelCustomItem, TabPanelFooter, TabPanelHeader,
  TabPanelItem,
  TabPanelItemIconDirective, TabPanelNav
} from '@ngstarter/components/tab-panel';
import { Icon } from '@ngstarter/components/icon';
import { Divider } from '@ngstarter/components/divider';
import { Avatar } from '@ngstarter/components/avatar';

@Component({
  selector: 'app-tab-panel-compact-example',
  imports: [
    Icon,
    Tooltip,
    Divider,
    Avatar,
    TabPanelItemIconDirective,
    TabPanelItem,
    TabPanelCustomItem,
    TabPanelAsideContentDirective,
    TabPanelAside,
    TabPanelNav,
    TabPanelFooter,
    TabPanelContent,
    TabPanelHeader,
    TabPanel
  ],
  templateUrl: './tab-panel-compact-example.html',
  styleUrl: './tab-panel-compact-example.scss'
})
export class TabPanelCompactExample {

}
