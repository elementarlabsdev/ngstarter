import { Component } from '@angular/core';
import {
  PanelContent,
  Panel,
  PanelFooter,
  PanelHeader,
} from '@ngstarter-ui/components/panel';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';

@Component({
  selector: 'app-basic-panel-example',
  imports: [
    PanelContent,
    PanelFooter,
    PanelHeader,
    Panel,
    ScrollbarArea
  ],
  templateUrl: './basic-panel-example.html',
  styleUrl: './basic-panel-example.scss'
})
export class BasicPanelExample {

}
