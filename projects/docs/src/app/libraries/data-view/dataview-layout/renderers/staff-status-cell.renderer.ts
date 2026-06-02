import { Component, input } from '@angular/core';
import { Chip } from '@ngstarter-ui/components/chips';
import { DataViewCellRenderer, DataViewColumnDef } from '@ngstarter-ui/components/data-view';
import { StaffStatus } from '../staff-data';

@Component({
  selector: 'app-dataview-layout-staff-status-cell',
  imports: [
    Chip
  ],
  templateUrl: './staff-status-cell.renderer.html',
  styleUrl: './staff-status-cell.renderer.scss'
})
export class StaffStatusCellRenderer implements DataViewCellRenderer {
  readonly element = input();
  readonly columnDef = input<DataViewColumnDef>();
  readonly fieldData = input<StaffStatus>();
}
