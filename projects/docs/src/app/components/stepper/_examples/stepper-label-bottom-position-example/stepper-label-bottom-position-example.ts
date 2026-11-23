import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField as SignalFormField, form, required } from '@angular/forms/signals';
import { Step, StepLabel, Stepper, StepperNext, StepperPrevious } from '@ngstarter-ui/components/stepper';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Button } from '@ngstarter-ui/components/button';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'app-stepper-label-bottom-position-example',
  imports: [
    FormsModule,
    SignalFormField,
    Stepper,
    Step,
    FormField,
    StepLabel,
    Label,
    Input,
    StepperNext,
    Button,
    StepperPrevious,
  ],
  templateUrl: './stepper-label-bottom-position-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './stepper-label-bottom-position-example.scss'
})
export class StepperLabelBottomPositionExample {

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
