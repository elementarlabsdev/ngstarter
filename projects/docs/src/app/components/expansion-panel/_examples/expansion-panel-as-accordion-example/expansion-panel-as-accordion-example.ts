import { Component } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Datepicker, DatepickerInput, provideNativeDateAdapter } from '@ngstarter-ui/components/datepicker';
import {
  Accordion, ActionRow,
  ExpansionPanel,
  ExpansionPanelHeader,
  ExpansionPanelDescription,
  ExpansionPanelTitle
} from '@ngstarter-ui/components/expansion';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'app-expansion-panel-as-accordion-example',
  imports: [
    Icon,
    Datepicker,
    DatepickerInput,
    ExpansionPanelDescription,
    ExpansionPanelTitle,
    ExpansionPanelHeader,
    ExpansionPanel,
    Accordion,
    Button,
    Input,
    Label,
    FormField,
    ActionRow
  ],
  templateUrl: './expansion-panel-as-accordion-example.html',
  styleUrl: './expansion-panel-as-accordion-example.scss',
  providers: [
    provideNativeDateAdapter()
  ]
})
export class ExpansionPanelAsAccordionExample {
  step = 0;

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }
}
