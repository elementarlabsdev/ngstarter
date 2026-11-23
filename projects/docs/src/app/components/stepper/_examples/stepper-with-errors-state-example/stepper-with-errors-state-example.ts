import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { FormsModule } from '@angular/forms';
import { FormField as SignalFormField, form, required } from '@angular/forms/signals';
import { Button } from '@ngstarter-ui/components/button';
import { Step, StepLabel, Stepper, StepperNext, StepperPrevious } from '@ngstarter-ui/components/stepper';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'app-stepper-with-errors-state-example',
  imports: [
    FormsModule,
    SignalFormField,
    Button,
    StepperNext,
    Input,
    Label,
    FormField,
    Step,
    Stepper,
    StepLabel,
    StepperPrevious,
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
  templateUrl: './stepper-with-errors-state-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './stepper-with-errors-state-example.scss'
})
export class StepperWithErrorsStateExample {

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
