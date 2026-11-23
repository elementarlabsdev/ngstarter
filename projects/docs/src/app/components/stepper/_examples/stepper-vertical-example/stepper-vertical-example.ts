import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField as SignalFormField, form, required } from '@angular/forms/signals';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { Step, StepLabel, Stepper, StepperNext, StepperPrevious } from '@ngstarter-ui/components/stepper';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-stepper-vertical-example',
  imports: [
    FormsModule,
    SignalFormField,
    Label,
    FormField,
    StepLabel,
    Input,
    Button,
    StepperNext,
    Step,
    Stepper,
    StepperPrevious,
  ],
  templateUrl: './stepper-vertical-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './stepper-vertical-example.scss'
})
export class StepperVerticalExample {

  firstFormGroup = form(signal({
    firstCtrl: '',
  }), (path) => {
    required(path.firstCtrl);
  });
  secondFormGroup = form(signal({
    secondCtrl: '',
  }), (path) => {
    required(path.secondCtrl);
  });
  isLinear = false;
}
