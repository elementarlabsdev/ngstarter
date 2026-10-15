import { Component, ChangeDetectionStrategy } from '@angular/core';
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
  Table,
} from '@ngstarter-ui/components/table';

@Component({
  selector: 'app-api',
  imports: [
    Table,
    HeaderCellDef,
    HeaderCell,
    Cell,
    CellDef,
    ColumnDef,
    HeaderRowDef,
    RowDef,
    HeaderRow,
    Row,
  ],
  templateUrl: './api.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Api {
  readonly properties = [
    {
      name: 'nodes',
      type: 'readonly TreeSelectNode[]',
      default: '[]',
      description: 'Immutable nodes with unique value, label, children, disabled, and hasChildren.',
    },
    {
      name: 'value / valueChange',
      type: 'TreeSelectKey | TreeSelectKey[] | null',
      default: 'null',
      description:
        'Two-way binding. Also supports ngModel and reactive forms. External writes do not invoke the form change callback.',
    },
    { name: 'multiple', type: 'boolean', default: 'false', description: 'Select several values.' },
    {
      name: 'leavesOnly',
      type: 'boolean',
      default: 'false',
      description: 'Prevent selecting branch values.',
    },
    {
      name: 'cascade',
      type: 'boolean',
      default: 'true',
      description:
        'Multiple selection cascades to enabled loaded leaves. False selects nodes independently.',
    },
    {
      name: 'searchable / clearable',
      type: 'boolean',
      default: 'true / false',
      description: 'Show search or a clear action.',
    },
    {
      name: 'loadChildren',
      type: 'TreeSelectChildrenLoader | null',
      default: 'null',
      description:
        'Resolve child arrays, promises, or observables when an unloaded node expands. Cached until the input node array or loader changes.',
    },
    {
      name: 'placeholder / emptyText',
      type: 'string',
      default: 'Choose an item / No matching items',
      description: 'Trigger placeholder and empty search text.',
    },
    {
      name: 'disabled / required',
      type: 'boolean',
      default: 'false',
      description: 'Form field states. Disabled also follows the Angular form control.',
    },
    {
      name: 'aria-label',
      type: 'string | null',
      default: 'null',
      description: 'Accessible trigger and tree label; falls back to placeholder.',
    },
    {
      name: 'selectionChange',
      type: 'TreeSelectValue',
      default: '—',
      description: 'Emits for user changes, including clear.',
    },
    { name: 'opened / closed', type: 'void', default: '—', description: 'Popup lifecycle events.' },
    {
      name: 'loadError',
      type: '{ node: TreeSelectNode; error: unknown }',
      default: '—',
      description: 'Failed child load; the user can retry.',
    },
  ];
}
