import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField as SignalFormField, form, required } from '@angular/forms/signals';
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
    SignalFormField,
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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './stepper-responsive-example.scss'
})
export class StepperResponsiveExample {

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
  thirdFormGroup = form(signal({
    thirdCtrl: '',
  }), (path) => {
    required(path.thirdCtrl);
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
