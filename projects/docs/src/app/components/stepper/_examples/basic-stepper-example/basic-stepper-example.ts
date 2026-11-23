import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField as SignalFormField, form, required } from '@angular/forms/signals';
import { Step, StepLabel, Stepper, StepperNext, StepperPrevious } from '@ngstarter-ui/components/stepper';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'app-basic-stepper-example',
  imports: [
    FormsModule,
    SignalFormField,
    Step,
    Stepper,
    Button,
    StepLabel,
    Label,
    FormField,
    Input,
    StepperNext,
    StepperPrevious,
  ],
  templateUrl: './basic-stepper-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-stepper-example.scss'
})
export class BasicStepperExample {

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
