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
  StepTracker,
  StepTrackerItem
} from '@ngstarter-ui/components/step-tracker';`;

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

  properties = [
    {
      name: 'ngs-step-tracker',
      description: 'Container for status-only step tracker items.',
      type: 'component',
      default: '-'
    },
    {
      name: 'orientation',
      description: 'Layout direction for the tracker.',
      type: "'vertical' | 'horizontal'",
      default: 'vertical'
    },
    {
      name: 'activeIndex',
      description: 'Optional zero-based active step index. Auto-state items before it become completed, the matching item becomes current, and later items become pending. Set it to the item count to mark every auto-state item completed.',
      type: 'number | null',
      default: 'null'
    },
    {
      name: 'ngs-step-tracker-item',
      description: 'One status step inside a tracker.',
      type: 'component',
      default: '-'
    },
    {
      name: 'state',
      description: 'Visual status for the step item. Use auto to let the parent activeIndex resolve completed/current/pending.',
      type: "'auto' | 'completed' | 'current' | 'pending' | 'error' | 'disabled'",
      default: 'auto'
    },
    {
      name: 'label',
      description: 'Optional compact label input for the step item.',
      type: 'string',
      default: "''"
    },
    {
      name: 'description',
      description: 'Optional supporting text input for the step item.',
      type: 'string',
      default: "''"
    },
    {
      name: 'ngs-step-tracker-label, [ngsStepTrackerLabel]',
      description: 'Projected label content for richer step item templates.',
      type: 'component',
      default: '-'
    },
    {
      name: 'ngs-step-tracker-description, [ngsStepTrackerDescription]',
      description: 'Projected description content for richer step item templates.',
      type: 'component',
      default: '-'
    }
  ];

  events = [
    {
      name: 'activeIndexChange',
      description: 'Emitted by the activeIndex model when StepTracker methods update the active step.'
    }
  ];

  methods = [
    {
      name: 'setActiveIndex(index: number)',
      description: 'Sets the active step index programmatically.'
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
