import { Component, viewChild } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { Input } from '@ngstarter/components/input';
import { Datepicker, DatepickerInput, provideNativeDateAdapter } from '@ngstarter/components/datepicker';
import { Button } from '@ngstarter/components/button';
import {
  Accordion,
  ExpansionPanel,
  ExpansionPanelHeader,
  ExpansionPanelDescription,
  ExpansionPanelTitle
} from '@ngstarter/components/expansion';
import { FormField, Label } from '@ngstarter/components/form-field';

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
