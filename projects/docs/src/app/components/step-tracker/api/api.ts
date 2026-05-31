import { Component } from '@angular/core';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import {
  Cell,
  CellDef,
  ColumnDef,
  HeaderCell,
  HeaderCellDef,
  HeaderRow,
  HeaderRowDef,
  Row,
  RowDef,
  Table
} from '@ngstarter-ui/components/table';

@Component({
  selector: 'app-api',
  imports: [
    Cell,
    CellDef,
    CodeHighlighter,
    ColumnDef,
    HeaderCell,
    HeaderCellDef,
    HeaderRow,
    HeaderRowDef,
    Row,
    RowDef,
    Table,
  ],
  templateUrl: './api.html',
})
export class Api {
  importExample = `import {
  provideStepTracker,
  STEP_TRACKER_CONFIG,
  StepTracker,
  StepTrackerCompletedIcon,
  StepTrackerErrorIcon,
  StepTrackerItem
} from '@ngstarter-ui/components/step-tracker';`;

  configExample = `import { provideStepTracker } from '@ngstarter-ui/components/step-tracker';

export const appConfig = {
  providers: [
    provideStepTracker({
      completedIconName: 'fluent:shield-checkmark-24-regular',
      errorIconName: 'fluent:warning-24-regular',
    }),
  ],
};`;

  compactExample = `<ngs-step-tracker>
  <ngs-step-tracker-item state="completed" label="Pay period & Employee"/>
  <ngs-step-tracker-item state="current" label="Total Hours" description="Review working hours"/>
  <ngs-step-tracker-item state="pending" label="Review payroll"/>
</ngs-step-tracker>`;

  dynamicExample = `<ngs-step-tracker [(activeIndex)]="activeIndex">
  <ngs-step-tracker-item label="Pay period & Employee"/>
  <ngs-step-tracker-item label="Total Hours" description="Review working hours"/>
  <ngs-step-tracker-item state="error" label="Time off" description="Missing approval"/>
  <ngs-step-tracker-item label="Review payroll"/>
</ngs-step-tracker>`;

  projectedExample = `<ngs-step-tracker-item state="current">
  <ngs-step-tracker-label>Total Hours</ngs-step-tracker-label>
  <ngs-step-tracker-description>
    Review working hours before approval.
  </ngs-step-tracker-description>
</ngs-step-tracker-item>`;

  iconsExample = `<ngs-step-tracker orientation="horizontal">
  <ng-template ngsStepTrackerCompletedIcon>
    <ngs-icon name="fluent:shield-checkmark-24-regular"/>
  </ng-template>

  <ng-template ngsStepTrackerErrorIcon>
    <ngs-icon name="fluent:warning-24-regular"/>
  </ng-template>

  <ngs-step-tracker-item state="completed" label="Created"/>
  <ngs-step-tracker-item state="error" label="Documents"/>
</ngs-step-tracker>`;

  properties = [
    {
      name: 'ngs-step-tracker',
      description: 'Container for status-only step tracker items. It owns orientation, activeIndex resolution, connector layout, and tracker-level icon template registration.',
      type: 'component',
      default: '-'
    },
    {
      name: 'orientation',
      description: 'Layout direction for the tracker. Use vertical for sidebars and compact cards, and horizontal for headers, summaries, and wide review surfaces.',
      type: "'vertical' | 'horizontal'",
      default: 'vertical'
    },
    {
      name: 'activeIndex',
      description: 'Optional zero-based active step index. Auto-state items before it become completed, the matching item becomes current, and later items become pending. Use null to leave auto items pending, or set it to the item count to mark every auto-state item completed.',
      type: 'number | null',
      default: 'null'
    },
    {
      name: 'ngs-step-tracker-item',
      description: 'One status step inside a tracker. It renders the indicator, connector, label, description, and resolved visual state.',
      type: 'component',
      default: '-'
    },
    {
      name: 'state',
      description: 'Visual status for the step item. Use auto to let the parent activeIndex resolve completed/current/pending, or set a fixed status when the item should stay completed, current, pending, error, or disabled.',
      type: "'auto' | 'completed' | 'current' | 'pending' | 'error' | 'disabled'",
      default: 'auto'
    },
    {
      name: 'label',
      description: 'Optional compact label input for the step item. Use projected label content instead when the label needs markup.',
      type: 'string',
      default: "''"
    },
    {
      name: 'description',
      description: 'Optional supporting text input for the step item. Use projected description content instead when the description needs markup.',
      type: 'string',
      default: "''"
    },
    {
      name: 'ngs-step-tracker-label, [ngsStepTrackerLabel]',
      description: 'Projected label content for richer step item templates. Used when the label input is empty.',
      type: 'component',
      default: '-'
    },
    {
      name: 'ngs-step-tracker-description, [ngsStepTrackerDescription]',
      description: 'Projected description content for richer step item templates. Used when the description input is empty.',
      type: 'component',
      default: '-'
    },
    {
      name: '[ngsStepTrackerCompletedIcon]',
      description: 'Template directive that registers the icon rendered inside completed indicators for the current tracker. Overrides globally configured icon names.',
      type: 'directive',
      default: 'fluent:checkmark-16-filled'
    },
    {
      name: '[ngsStepTrackerErrorIcon]',
      description: 'Template directive that registers the icon rendered inside error indicators for the current tracker. Overrides globally configured icon names.',
      type: 'directive',
      default: 'fluent:error-circle-16-filled'
    },
    {
      name: 'provideStepTracker(config)',
      description: 'Environment provider for global default completed and error indicator icon names. Use it in appConfig providers when every tracker should share the same default icons.',
      type: 'provider',
      default: '-'
    },
    {
      name: 'STEP_TRACKER_CONFIG',
      description: 'Injection token used by the provider to configure global indicator icon names. Advanced consumers can provide it directly when needed.',
      type: 'InjectionToken<StepTrackerConfig>',
      default: "{ completedIconName: 'fluent:checkmark-16-filled', errorIconName: 'fluent:error-circle-16-filled' }"
    }
  ];

  events = [
    {
      name: 'activeIndexChange',
      description: 'Emitted by the activeIndex model when the active step changes through two-way binding or StepTracker methods.'
    }
  ];

  methods = [
    {
      name: 'setActiveIndex(index: number)',
      description: 'Sets the active step index programmatically. Values are clamped to the valid range by the tracker.'
    },
    {
      name: 'next()',
      description: 'Moves activeIndex to the next step, clamped to the item count so the final step can become completed.'
    },
    {
      name: 'previous()',
      description: 'Moves activeIndex to the previous step, clamped to the first item.'
    }
  ];
}
