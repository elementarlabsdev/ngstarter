import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormField as SignalFormField, form, required } from '@angular/forms/signals';
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
    SignalFormField,
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
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './stepper-hidden-header-border-example.html',
})
export class StepperHiddenHeaderBorderExample {

  readonly accountForm = form(signal({
    accountName: '',
  }), (path) => {
    required(path.accountName);
  });

  readonly workspaceForm = form(signal({
    workspaceName: '',
  }), (path) => {
    required(path.workspaceName);
  });
}
