import { Component, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter/components/data-view';
import { ContentFade } from '@ngstarter/components/content-fade';

@Component({
  selector: 'app-link-cell',
  imports: [
    ContentFade
  ],
  templateUrl: './link-cell.renderer.html',
  styleUrl: './link-cell.renderer.scss'
})
export class LinkCellRenderer {
  element = input();
  columnDef = input();
  fieldData = input<string>();
}
