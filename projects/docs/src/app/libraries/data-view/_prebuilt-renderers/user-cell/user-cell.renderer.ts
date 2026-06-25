import { Component, input } from '@angular/core';
import { DataViewCellRenderer, DataViewColumnDef } from '@ngstarter-ui/components/data-view';
import { Avatar } from '@ngstarter-ui/components/avatar';

@Component({
  selector: 'app-user-cell',
  imports: [
    Avatar
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
