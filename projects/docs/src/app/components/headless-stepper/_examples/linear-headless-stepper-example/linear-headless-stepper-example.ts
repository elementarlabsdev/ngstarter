import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormField as SignalFormField, form, email, required } from '@angular/forms/signals';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { HeadlessStep, HeadlessStepper } from '@ngstarter-ui/components/headless-stepper';
import { Input } from '@ngstarter-ui/components/input';
import { ProgressBar } from '@ngstarter-ui/components/progress-bar';

@Component({
  selector: 'app-linear-headless-stepper-example',
  imports: [
    Button,
    DecimalPipe,
    FormField,
    HeadlessStep,
    HeadlessStepper,
    Input,
    Label,
    ProgressBar,
    SignalFormField
  ],
  templateUrl: './linear-headless-stepper-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './linear-headless-stepper-example.scss'
})
export class LinearHeadlessStepperExample {

  readonly accountForm = form(signal({
    company: '',
  }), (path) => {
    required(path.company);
  });

  readonly billingForm = form(signal({
    email: '',
  }), (path) => {
    required(path.email);
    email(path.email);
  });
}
