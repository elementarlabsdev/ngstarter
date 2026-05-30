import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
    ReactiveFormsModule
  ],
  templateUrl: './linear-headless-stepper-example.html',
  styleUrl: './linear-headless-stepper-example.scss'
})
export class LinearHeadlessStepperExample {
  private readonly formBuilder = inject(FormBuilder);

  readonly accountForm = this.formBuilder.group({
    company: ['', Validators.required]
  });

  readonly billingForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]]
  });
}
