import { Component, viewChild } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Input } from '@ngstarter-ui/components/input';
import { Datepicker, DatepickerInput, provideNativeDateAdapter } from '@ngstarter-ui/components/datepicker';
import { Button } from '@ngstarter-ui/components/button';
import {
  Accordion,
  ExpansionPanel,
  ExpansionPanelHeader,
  ExpansionPanelDescription,
  ExpansionPanelTitle
} from '@ngstarter-ui/components/expansion';
import { FormField, Label } from '@ngstarter-ui/components/form-field';

@Component({
  selector: 'app-expansion-panel-expand-collapse-toggles-example',
  imports: [
    Icon,
    Datepicker,
    DatepickerInput,
    Button,
    ExpansionPanelDescription,
    ExpansionPanelTitle,
    ExpansionPanelHeader,
    ExpansionPanel,
    Accordion,
    Label,
    FormField,
    Input
  ],
  templateUrl: './expansion-panel-expand-collapse-toggles-example.html',
  styleUrl: './expansion-panel-expand-collapse-toggles-example.scss',
  providers: [
    provideNativeDateAdapter()
  ]
})
export class ExpansionPanelExpandCollapseTogglesExample {
  readonly accordion = viewChild.required(Accordion);
}
