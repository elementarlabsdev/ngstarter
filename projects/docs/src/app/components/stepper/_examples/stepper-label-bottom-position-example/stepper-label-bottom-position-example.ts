import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Step, StepLabel, Stepper, StepperNext, StepperPrevious } from '@ngstarter-ui/components/stepper';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Button } from '@ngstarter-ui/components/button';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'app-stepper-label-bottom-position-example',
  imports: [
    FormsModule,
    ReactiveFormsModule,
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
  styleUrl: './stepper-label-bottom-position-example.scss'
})
export class StepperLabelBottomPositionExample {
  private _formBuilder = inject(FormBuilder);

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
}
