import { Component, signal } from '@angular/core';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import {
  PanelAside,
  PanelContent,
  Panel,
  PanelFooter,
  PanelHeader, PanelSidebar
} from '@ngstarter/components/panel';

@Component({
  selector: 'app-panel-with-extra-columns-example',
  imports: [
    ScrollbarArea,
    PanelContent,
    Panel,
    PanelFooter,
    PanelHeader,
    PanelSidebar,
    PanelAside
  ],
  templateUrl: './panel-with-extra-columns-example.html',
  styleUrl: './panel-with-extra-columns-example.scss'
})
export class PanelWithExtraColumnsExample {
  width = signal(200);

  setSidebarLongWidth() {
    this.width.set(400);
  }
}
