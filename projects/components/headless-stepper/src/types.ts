import { StepComponent } from '@ngstarter-ui/components/stepper/step';

export interface StepperSelectionEvent {
  previouslySelectedIndex: number;
  previouslySelectedStep: StepComponent | undefined;
  selectedIndex: number;
  selectedStep: StepComponent;
}
