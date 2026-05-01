import {
  Component, input,
  numberAttribute,
  OnInit
} from '@angular/core';

@Component({
  selector: 'ngs-gauge',
  exportAs: 'ngsGauge',
  templateUrl: './gauge.html',
  styleUrl: './gauge.scss',
  host: {
    'class': 'ngs-gauge'
  }
})
export class Gauge implements OnInit {
  value = input(0, {
    transform: numberAttribute
  });
  strokeWidth = input(10, {
    transform: numberAttribute
  });
  radius = input(50, {
    transform: numberAttribute
  });

  protected strokeDasharray: string;
  protected initialOffset: number;
  protected strokeDashoffset: number;

  ngOnInit() {
    const circumference = 2 * Math.PI * this.radius();
    const valueInCircumference = (this.value() / 100) * circumference;
    this.strokeDasharray = `${circumference} ${circumference}`;
    this.initialOffset = circumference;
    this.strokeDashoffset = this.initialOffset - valueInCircumference;
  }
}
