import { Component, inject, input, OnInit } from '@angular/core';
import { GRID, Grid } from '@ngstarter-ui/components/grid';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-analytics-total-orders-content',
  imports: [
    Icon
  ],
  templateUrl: './analytics-total-orders-widget.html',
  styleUrl: './analytics-total-orders-widget.scss'
})
export class AnalyticsTotalOrdersWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  content = input<any>();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
