import { Component, signal } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Card, CardContent } from '@ngstarter-ui/components/card';
import { HeadlessStep, HeadlessStepper } from '@ngstarter-ui/components/headless-stepper';
import { ProgressBar } from '@ngstarter-ui/components/progress-bar';

@Component({
  selector: 'app-basic-headless-stepper-example',
  imports: [
    Button,
    Card,
    CardContent,
    HeadlessStep,
    HeadlessStepper,
    ProgressBar
  ],
  templateUrl: './basic-headless-stepper-example.html',
  styleUrl: './basic-headless-stepper-example.scss'
})
export class BasicHeadlessStepperExample {
  readonly selectedIndex = signal(0);
  readonly steps = [
    {
      title: 'Workspace',
      description: 'Choose how the new workspace should be organized.'
    },
    {
      title: 'People',
      description: 'Invite teammates and choose the default access level.'
    },
    {
      title: 'Review',
      description: 'Confirm the setup details before creating the workspace.'
    }
  ];
}
