import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-label',
  templateUrl: './label.html',
  styleUrl: './label.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-label',
  }
})
export class Label {
}
