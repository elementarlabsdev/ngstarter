import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter-ui/components/data-view';
import { ContentFade } from '@ngstarter-ui/components/content-fade';

@Component({
  selector: 'app-link-cell',
  imports: [
    ContentFade
  ],
  templateUrl: './link-cell.renderer.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './link-cell.renderer.scss'
})
export class LinkCellRenderer {
  element = input();
  columnDef = input();
  fieldData = input<string>();
}
