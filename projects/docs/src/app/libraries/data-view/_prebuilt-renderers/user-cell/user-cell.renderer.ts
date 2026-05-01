import { Component, input } from '@angular/core';
import { DataViewCellRenderer, DataViewColumnDef } from '@ngstarter/components/data-view';
import { Dicebear } from '@ngstarter/components/avatar';

@Component({
  selector: 'app-user-cell',
  imports: [
    Dicebear
  ],
  templateUrl: './user-cell.renderer.html',
  styleUrl: './user-cell.renderer.scss'
})
export class UserCellRenderer implements DataViewCellRenderer {
  cellRenderer = 'user';
  component = () => Promise.resolve(UserCellRenderer);

  element = input<any>();
  columnDef = input<DataViewColumnDef>();
  fieldData = input();
}
