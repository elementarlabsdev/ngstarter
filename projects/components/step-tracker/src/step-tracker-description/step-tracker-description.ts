import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-step-tracker-description, [ngsStepTrackerDescription]',
  exportAs: 'ngsStepTrackerDescription',
  templateUrl: './step-tracker-description.html',
  styleUrl: './step-tracker-description.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-step-tracker-description',
  },
})
export class StepTrackerDescription {}
