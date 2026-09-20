import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter-ui/components/data-view';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-date-cell',
  imports: [
    DatePipe
  ],
  templateUrl: './date-cell.renderer.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './date-cell.renderer.scss'
})
export class DateCellRenderer {
  element = input();
  columnDef = input();
  fieldData = input<string>();
}
