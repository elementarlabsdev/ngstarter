import { Component } from '@angular/core';
import {
  LayoutAside,
  LayoutContent,
  Layout,
  LayoutHeader
} from '@ngstarter/components/layout';
import { SidePanel } from '@ngstarter/components/side-panel';
import { SidePanelTab } from '@ngstarter/components/side-panel/src/side-panel-tab/side-panel-tab';

@Component({
  selector: 'app-basic-side-panel-example',
  imports: [
    Layout,
    LayoutHeader,
    LayoutContent,
    LayoutAside,
    SidePanel,
    SidePanelTab
  ],
  templateUrl: './basic-side-panel-example.html',
  styleUrl: './basic-side-panel-example.scss'
})
export class BasicSidePanelExample {

}
