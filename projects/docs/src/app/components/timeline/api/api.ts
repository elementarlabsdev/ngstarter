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
      name: 'ngs-timeline',
      description: 'Главный контейнер для элементов временной шкалы (timeline items).',
      type: 'component',
      default: '–'
    },
    {
      name: 'ngs-timeline-item',
      description: 'Элемент временной шкалы.',
      type: 'component',
      default: '–'
    },
    {
      name: 'ngs-timeline-header',
      description: 'Заголовок группы элементов временной шкалы (например, дата).',
      type: 'component',
      default: '–'
    },
    {
      name: 'ngs-timeline-title',
      description: 'Заголовок события в элементе временной шкалы.',
      type: 'component',
      default: '–'
    },
    {
      name: 'ngs-timeline-subtitle',
      description: 'Подзаголовок события.',
      type: 'component',
      default: '–'
    },
    {
      name: 'ngs-timeline-description',
      description: 'Описание события.',
      type: 'component',
      default: '–'
    },
    {
      name: 'ngs-timeline-timestamp',
      description: 'Метка времени для события.',
      type: 'component',
      default: '–'
    },
    {
      name: 'ngs-timeline-attributes',
      description: 'Дополнительные атрибуты или метаданные события.',
      type: 'component',
      default: '–'
    },
    {
      name: 'ngsTimelineItemIndicator',
      description: 'Директива для кастомизации индикатора события (используется внутри ng-template).',
      type: 'directive',
      default: '–'
    }
  ];
  events = [];
}
