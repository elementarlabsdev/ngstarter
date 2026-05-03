import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  standalone: true,
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
  styleUrl: './api.scss',
})
export class ApiComponent {
  cardProperties = [
    {
      name: 'appearance',
      description: 'The visual appearance of the card.',
      type: "'raised' | 'outlined' | 'filled'",
      default: "'outlined'"
    }
  ];

  cardActionsProperties = [
    {
      name: 'align',
      description: 'The horizontal alignment of the actions.',
      type: "'start' | 'center' | 'end' | 'between'",
      default: "'start'"
    }
  ];

  directives = [
    { selector: 'ngs-card-header', description: 'Header section of the card.' },
    { selector: 'ngs-card-title', description: 'Title within the card header.' },
    { selector: 'ngs-card-subtitle', description: 'Subtitle within the card header.' },
    { selector: 'ngs-card-content', description: 'Main content section of the card.' },
    { selector: 'ngs-card-footer', description: 'Footer section of the card.' },
    { selector: 'ngs-card-image', description: 'Image section of the card.' },
    { selector: 'ngs-card-avatar', description: 'Avatar section within the card header.' },
    { selector: 'ngs-card-aside', description: 'Aside section for side-by-side card layout.' }
  ];
}
