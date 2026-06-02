import { Component, input } from '@angular/core';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { DataViewCellRenderer, DataViewColumnDef } from '@ngstarter-ui/components/data-view';
import { StaffMember } from '../../staff-data';
import {Chip} from "@ngstarter-ui/components/chips";

@Component({
  selector: 'app-dataview-layout-staff-name-cell',
  imports: [
    Dicebear,
    Chip
  ],
  templateUrl: './staff-name-cell.renderer.html',
  styleUrl: './staff-name-cell.renderer.scss'
})
export class StaffNameCellRenderer implements DataViewCellRenderer {
  readonly element = input<StaffMember>();
  readonly columnDef = input<DataViewColumnDef>();
  readonly fieldData = input<string>();
}
