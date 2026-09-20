import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-kbd-group',
  exportAs: 'ngsKbdGroup',
  imports: [],
  templateUrl: './kbd-group.html',
  styleUrl: './kbd-group.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-kdb-group'
  }
})
export class KbdGroup {

}
