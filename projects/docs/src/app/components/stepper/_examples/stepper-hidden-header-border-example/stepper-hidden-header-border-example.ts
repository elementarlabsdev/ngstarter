import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import {
  Step,
  StepLabel,
  Stepper,
  StepperNext,
  StepperPrevious,
} from '@ngstarter-ui/components/stepper';

@Component({
  selector: 'app-stepper-hidden-header-border-example',
  imports: [
    ReactiveFormsModule,
    Button,
    FormField,
    Input,
    Label,
    Step,
    StepLabel,
    Stepper,
    StepperNext,
    StepperPrevious,
  ],
  templateUrl: './stepper-hidden-header-border-example.html',
})
export class StepperHiddenHeaderBorderExample {
  private readonly _formBuilder = inject(FormBuilder);

  readonly accountForm = this._formBuilder.group({
    accountName: ['', Validators.required],
  });

  readonly workspaceForm = this._formBuilder.group({
    workspaceName: ['', Validators.required],
  });
}
