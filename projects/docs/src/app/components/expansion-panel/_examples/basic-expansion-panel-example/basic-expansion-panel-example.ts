import { Component } from '@angular/core';
import {
  Accordion,
  ExpansionPanel,
  ExpansionPanelHeader,
  ExpansionPanelDescription,
  ExpansionPanelTitle
} from '@ngstarter/components/expansion';

@Component({
  selector: 'app-basic-expansion-panel-example',
  imports: [
    ExpansionPanelDescription,
    ExpansionPanelTitle,
    ExpansionPanelHeader,
    ExpansionPanel,
    Accordion
  ],
  templateUrl: './basic-expansion-panel-example.html',
  styleUrl: './basic-expansion-panel-example.scss'
})
export class BasicExpansionPanelExample {
  panelOpenState = false;
}
