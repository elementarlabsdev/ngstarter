import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { map, Observable } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Step, StepLabel, Stepper, StepperNext, StepperPrevious } from '@ngstarter-ui/components/stepper';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { Button } from '@ngstarter-ui/components/button';
import { StepperOrientation } from '@angular/cdk/stepper';

@Component({
  selector: 'app-stepper-responsive-example',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe,
    Step,
    Stepper,
    Label,
    FormField,
    Input,
    Button,
    StepperNext,
    StepLabel,
    StepperPrevious,
  ],
  templateUrl: './stepper-responsive-example.html',
  styleUrl: './stepper-responsive-example.scss'
})
export class StepperResponsiveExample {
  private _formBuilder = inject(FormBuilder);

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  thirdFormGroup = this._formBuilder.group({
    thirdCtrl: ['', Validators.required],
  });
  stepperOrientation: Observable<StepperOrientation>;

  constructor(
    breakpointObserver: BreakpointObserver,
  ) {
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches}) => (matches ? 'horizontal' : 'vertical')));
  }
}
