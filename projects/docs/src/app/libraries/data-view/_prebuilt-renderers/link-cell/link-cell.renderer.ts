import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter-ui/components/data-view';

@Component({
  selector: 'app-link-cell',
  templateUrl: './link-cell.renderer.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './link-cell.renderer.scss'
})
export class LinkCellRenderer {
  element = input();
  columnDef = input();
  fieldData = input<string>();
}
