import { Component } from '@angular/core';
import {
  Cell,
  CellDef,
  ColumnDef,
  HeaderCell,
  HeaderCellDef, HeaderRow,
  HeaderRowDef, Row,
  RowDef,
  Table
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
    Row
  ],
  templateUrl: './api.html',
})
export class Api {
  properties = [
    {
      name: 'language',
      description: 'The language to use for emoji category names and descriptions.',
      type: 'string',
      default: 'en'
    },
    {
      name: 'selectEmojiLabel',
      description: 'Placeholder text displayed when no emoji is hovered.',
      type: 'string',
      default: 'Select an emoji...'
    },
    {
        name: 'position',
        description: 'Position of the emoji picker relative to the trigger (for directive).',
        type: 'PopoverPosition',
        default: 'below-start'
    }
  ];
  events = [
    {
      name: 'emojiSelected',
      description: 'Emits when an emoji is selected from the picker.'
    },
    {
        name: 'opened',
        description: 'Emits when the emoji picker is opened (for directive).'
    },
    {
        name: 'closed',
        description: 'Emits when the emoji picker is closed (for directive).'
    }
  ];
}
