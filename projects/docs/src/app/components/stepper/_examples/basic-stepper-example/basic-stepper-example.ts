import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Step, StepLabel, Stepper, StepperNext, StepperPrevious } from '@ngstarter/components/stepper';
import { Button } from '@ngstarter/components/button';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';

@Component({
  selector: 'app-basic-stepper-example',
  imports: [
    FormsModule,
    ReactiveFormsModule,
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
  styleUrl: './basic-stepper-example.scss'
})
export class BasicStepperExample {
  private _formBuilder = inject(FormBuilder);

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = false;
}
