import { Component, input } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { DataViewCellRenderer, DataViewColumnDef } from '@ngstarter-ui/components/data-view';
import { Icon } from '@ngstarter-ui/components/icon';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';

@Component({
  selector: 'app-dataview-layout-staff-actions-cell',
  imports: [
    Button,
    Icon,
    Menu,
    MenuItem,
    MenuTrigger
  ],
  templateUrl: './staff-actions-cell.renderer.html',
  styleUrl: './staff-actions-cell.renderer.scss'
})
export class StaffActionsCellRenderer implements DataViewCellRenderer {
  readonly element = input();
  readonly columnDef = input<DataViewColumnDef>();
  readonly fieldData = input();
}
