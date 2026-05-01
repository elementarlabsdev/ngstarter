import { Component, inject, input } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { SelectionModel } from '@angular/cdk/collections';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray
} from '@angular/cdk/drag-drop';
import { GRID, Grid, GridItemAware } from '@ngstarter/components/grid';
import { Button } from '@ngstarter/components/button';
import {
  Cell,
  CellDef,
  ColumnDef,
  HeaderCell,
  HeaderCellDef, HeaderRow,
  HeaderRowDef, Row, RowDef,
  Table,
  TableDataSource
} from '@ngstarter/components/table';
import { Checkbox } from '@ngstarter/components/checkbox';

export interface TodoTask {
  name: string;
  position: number;
  assignee: {
    name: string
  };
  priority: {
    id: string,
    name: string
  };
}

const DATA: TodoTask[] = [
  { position: 1, name: 'Hydrogen', assignee: { name: 'Me' }, priority: { id: 'high', name: 'High' } },
  { position: 2, name: 'Helium', assignee: { name: 'Me' }, priority: { id: 'medium', name: 'Medium' } },
  { position: 3, name: 'Lithium', assignee: { name: 'Me' }, priority: { id: 'low', name: 'Low' } },
  { position: 4, name: 'Beryllium', assignee: { name: 'Me' }, priority: { id: 'medium', name: 'Medium' } },
  { position: 5, name: 'Beryllium', assignee: { name: 'Me' }, priority: { id: 'medium', name: 'Medium' } },
  { position: 6, name: 'Beryllium', assignee: { name: 'Me' }, priority: { id: 'low', name: 'Low' } }
];

@Component({
  selector: 'ngs-todos-content',
  imports: [
    Icon,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
    Button,
    Cell,
    HeaderCell,
    ColumnDef,
    HeaderCellDef,
    CellDef,
    Checkbox,
    Table,
    HeaderRowDef,
    RowDef,
    HeaderRow,
    Row
  ],
  templateUrl: './todos-widget.html',
  styleUrl: './todos-widget.scss'
})
export class TodosWidget implements GridItemAware {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  content = input();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }

  displayedColumns: string[] = ['drag', 'select', 'position', 'name', 'assignee', 'priority'];
  dataSource = new TableDataSource<TodoTask>(DATA);
  selection = new SelectionModel<TodoTask>(true, []);

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: TodoTask): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  drop(event: CdkDragDrop<TodoTask[]>) {
    const data = this.dataSource.data;
    moveItemInArray(data, event.previousIndex, event.currentIndex);
    this.dataSource.data = data;
  }
}
