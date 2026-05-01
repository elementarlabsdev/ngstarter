import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef, DialogTitle, DialogContent, DialogActions } from '@ngstarter/components/dialog';
import { Checkbox } from '@ngstarter/components/checkbox';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { Menu, MenuTrigger, MenuContent, MenuItem } from '@ngstarter/components/menu';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { DataViewColumnDef, DataViewPinAlign } from '../../types';

export interface ColumnSettingsDialogData {
  columns: DataViewColumnDef[];
}

export interface ColumnSettingsDialogResult {
  columns: DataViewColumnDef[];
}

@Component({
  selector: 'ngs-data-view-column-settings-dialog',
  templateUrl: './column-settings-dialog.html',
  styleUrl: './column-settings-dialog.scss',
  imports: [
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    Button,
    Icon,
    Menu,
    MenuTrigger,
    MenuContent,
    MenuItem,
    DragDropModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataViewColumnSettingsDialog {
  private _dialogRef = inject(DialogRef<DataViewColumnSettingsDialog, ColumnSettingsDialogResult>);
  private _data = inject<ColumnSettingsDialogData>(DIALOG_DATA);

  columns = signal<DataViewColumnDef[]>(this._data.columns
    .filter(c => c.withColumnSettings !== false)
    .map(c => ({ ...c }))
  );

  drop(event: CdkDragDrop<DataViewColumnDef[]>) {
    const updated = [...this.columns()];
    moveItemInArray(updated, event.previousIndex, event.currentIndex);
    this.columns.set(updated);
  }

  toggleVisibility(index: number, visible: boolean) {
    const updated = [...this.columns()];
    updated[index] = { ...updated[index], visible };
    this.columns.set(updated);
  }

  pinColumn(index: number, align: DataViewPinAlign | null) {
    const updated = [...this.columns()];
    if (align === null) {
      updated[index] = { ...updated[index], pinned: false, pinAlign: undefined };
    } else {
      updated[index] = { ...updated[index], pinned: true, pinAlign: align };
    }
    this.columns.set(updated);
  }

  apply() {
    this._dialogRef.close({ columns: this.columns() });
  }

  cancel() {
    this._dialogRef.close();
  }
}
