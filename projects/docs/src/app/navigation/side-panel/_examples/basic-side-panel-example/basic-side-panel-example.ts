import { Component } from '@angular/core';
import {
  LayoutAside,
  LayoutContent,
  Layout,
  LayoutHeader
} from '@ngstarter-ui/components/layout';
import { SidePanel, SidePanelTab } from '@ngstarter-ui/components/side-panel';

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
