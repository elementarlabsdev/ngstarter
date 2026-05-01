import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { Step, StepLabel, Stepper, StepperNext, StepperPrevious } from '@ngstarter/components/stepper';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'app-stepper-vertical-example',
  imports: [
    FormsModule,
    ReactiveFormsModule,
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
  styleUrl: './stepper-vertical-example.scss'
})
export class StepperVerticalExample {
  private _formBuilder = inject(FormBuilder);

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = false;
}
