import { Component, inject } from '@angular/core';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import { Step, StepLabel, Stepper, StepperNext, StepperPrevious } from '@ngstarter-ui/components/stepper';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'app-stepper-with-errors-state-example',
  imports: [
    FormsModule,
    ReactiveFormsModule,
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
  styleUrl: './stepper-with-errors-state-example.scss'
})
export class StepperWithErrorsStateExample {
  private _formBuilder = inject(FormBuilder);

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
}
