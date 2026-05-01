import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Input } from '@ngstarter-ui/components/input';
import { Step, StepLabel, Stepper, StepperNext, StepperPrevious } from '@ngstarter-ui/components/stepper';
import { Button } from '@ngstarter-ui/components/button';
import { FormField } from '@ngstarter-ui/components/form-field';

@Component({
  selector: 'app-stepper-header-position-example',
  imports: [
    FormsModule,
    ReactiveFormsModule,
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
  styleUrl: './stepper-header-position-example.scss'
})
export class StepperHeaderPositionExample {
  private _formBuilder = inject(FormBuilder);

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
}
