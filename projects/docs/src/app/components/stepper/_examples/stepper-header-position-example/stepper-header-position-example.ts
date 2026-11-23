import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField as SignalFormField, form, required } from '@angular/forms/signals';
import { Input } from '@ngstarter-ui/components/input';
import { Step, StepLabel, Stepper, StepperNext, StepperPrevious } from '@ngstarter-ui/components/stepper';
import { Button } from '@ngstarter-ui/components/button';
import { FormField } from '@ngstarter-ui/components/form-field';

@Component({
  selector: 'app-stepper-header-position-example',
  imports: [
    FormsModule,
    SignalFormField,
    Input,
    FormField,
    StepLabel,
    Step,
    Stepper,
    Button,
    StepperPrevious,
    StepperNext,
  ],
  templateUrl: './stepper-header-position-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './stepper-header-position-example.scss'
})
export class StepperHeaderPositionExample {

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
}
