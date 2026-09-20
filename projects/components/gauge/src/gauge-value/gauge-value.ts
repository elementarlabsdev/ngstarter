import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-gauge-value',
  exportAs: 'ngsGaugeValue',
  templateUrl: './gauge-value.html',
  styleUrl: './gauge-value.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-gauge-value'
  }
})
export class GaugeValue {
}
