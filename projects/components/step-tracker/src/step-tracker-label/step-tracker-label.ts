import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-step-tracker-label, [ngsStepTrackerLabel]',
  exportAs: 'ngsStepTrackerLabel',
  templateUrl: './step-tracker-label.html',
  styleUrl: './step-tracker-label.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-step-tracker-label',
  },
})
export class StepTrackerLabel {}
