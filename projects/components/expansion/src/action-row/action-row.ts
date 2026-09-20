import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-action-row',
  exportAs: 'ngsActionRow',
  templateUrl: './action-row.html',
  styleUrl: './action-row.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-action-row'
  }
})
export class ActionRow {

}
