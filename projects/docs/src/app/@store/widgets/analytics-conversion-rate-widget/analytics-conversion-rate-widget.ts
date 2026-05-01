import { Component, inject, input, OnInit } from '@angular/core';
import { GRID, Grid } from '@ngstarter-ui/components/grid';

@Component({
  selector: 'app-analytics-conversion-rate-content',
  imports: [],
  templateUrl: './analytics-conversion-rate-widget.html',
  styleUrl: './analytics-conversion-rate-widget.scss'
})
export class AnalyticsConversionRateWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  widget = input<any>();

  ngOnInit() {
    if (this._grid && this.widget()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
