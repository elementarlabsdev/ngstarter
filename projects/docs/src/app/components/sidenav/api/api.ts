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
  styleUrl: './api.scss',
})
export class Api {
  properties = [
    {
      name: 'adaptive',
      description: 'Включает адаптивный режим',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'adaptiveBreakpoint',
      description: 'Breakpoint для адаптивного режима',
      type: 'string',
      default: '(max-width: 991.98px)'
    },
    {
      name: 'opened',
      description: 'Состояние открытости sidenav',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'fixedWidth',
      description: 'Фиксированная ширина sidenav',
      type: 'number | string | null',
      default: 'null'
    },
    {
      name: 'mode',
      description: 'Режим отображения (\'over\', \'push\', \'side\')',
      type: 'SidenavMode',
      default: 'over'
    },
    {
      name: 'position',
      description: 'Позиция sidenav (\'start\', \'end\')',
      type: 'SidenavPosition',
      default: 'start'
    },
    {
      name: 'collapsed',
      description: 'Состояние свернутости sidenav',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'disableClose',
      description: 'Отключает возможность закрытия sidenav',
      type: 'boolean',
      default: 'false'
    }
  ];

  events = [
    {
      name: 'openedChange',
      description: 'Событие изменения состояния открытости'
    }
  ];
}
