import { Component, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter-ui/components/data-view';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-enabled-cell',
  imports: [
    Icon
  ],
  templateUrl: './enabled-cell.renderer.html',
  styleUrl: './enabled-cell.renderer.scss'
})
export class EnabledCellRenderer {
  element = input();
  columnDef = input();
  fieldData = input<string>();
}
