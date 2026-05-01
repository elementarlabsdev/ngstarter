import { Component, inject, input, OnInit } from '@angular/core';
import { GRID, Grid } from '@ngstarter/components/grid';
import { Icon } from '@ngstarter/components/icon';

@Component({
  selector: 'app-analytics-avg-order-value-content',
  imports: [
    Icon
  ],
  templateUrl: './analytics-avg-order-value-widget.html',
  styleUrl: './analytics-avg-order-value-widget.scss'
})
export class AnalyticsAvgOrderValueWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  widget = input<any>();

  ngOnInit() {
    if (this._grid && this.widget()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
