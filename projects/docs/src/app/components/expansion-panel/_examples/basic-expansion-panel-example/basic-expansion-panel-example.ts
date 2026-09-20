import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  Accordion,
  ExpansionPanel,
  ExpansionPanelHeader,
  ExpansionPanelDescription,
  ExpansionPanelTitle
} from '@ngstarter-ui/components/expansion';

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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-expansion-panel-example.scss'
})
export class BasicExpansionPanelExample {
  panelOpenState = false;
}
