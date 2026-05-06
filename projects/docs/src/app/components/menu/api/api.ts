import { Component } from '@angular/core';
import {
  Table,
  ColumnDef,
  HeaderCellDef,
  CellDef,
  HeaderRowDef,
  RowDef,
  HeaderCell,
  Cell,
  HeaderRow,
  Row
} from '@ngstarter-ui/components/table';

@Component({
  imports: [
    Table,
    ColumnDef,
    HeaderCellDef,
    CellDef,
    HeaderRowDef,
    RowDef,
    HeaderCell,
    Cell,
    HeaderRow,
    Row
  ],
  templateUrl: './api.html',
  styleUrl: './api.scss'
})
export class Api {
  readonly properties = [
    { name: 'role', description: 'The ARIA role for the menu.', type: "'menu' | 'menubar'", default: 'menu' },
    { name: 'classList', description: 'Classes to be passed to the menu panel.', type: 'string', default: "''" },
    { name: 'xPosition', description: 'Position of the menu in the X axis.', type: "'before' | 'after'", default: 'after' },
    { name: 'yPosition', description: 'Position of the menu in the Y axis.', type: "'above' | 'below'", default: 'below' },
  ];

  readonly triggerProperties = [
    { name: 'ngsMenuTriggerFor', description: 'The menu instance to be opened by this trigger.', type: 'Menu', default: 'null' },
    { name: 'ngsMenuTriggerData', description: 'Data to be passed to the menu instance.', type: 'any', default: 'undefined' },
    { name: 'ngsMenuDisabled', description: 'Whether the menu trigger is disabled.', type: 'boolean', default: 'false' },
    { name: 'ngsMenuTriggerRestoreFocus', description: 'Whether the menu should restore focus to the trigger on close.', type: 'boolean', default: 'true' },
  ];

  readonly events = [
    { name: 'closed', description: 'Event emitted when the menu is closed.' },
  ];

  readonly triggerEvents = [
    { name: 'menuOpened', description: 'Event emitted when the associated menu is opened.' },
    { name: 'menuClosed', description: 'Event emitted when the associated menu is closed.' },
  ];
}
