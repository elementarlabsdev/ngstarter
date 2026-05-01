import { Component } from '@angular/core';

@Component({
  selector: 'ngs-gauge-value',
  exportAs: 'ngsGaugeValue',
  templateUrl: './gauge-value.html',
  styleUrl: './gauge-value.scss',
  host: {
    'class': 'ngs-gauge-value'
  }
})
export class GaugeValue {
}
