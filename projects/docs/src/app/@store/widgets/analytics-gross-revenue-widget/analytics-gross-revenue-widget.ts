import { Component, inject, input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { GRID, Grid } from '@ngstarter-ui/components/grid';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-analytics-gross-revenue-content',
  imports: [
    Icon
  ],
  templateUrl: './analytics-gross-revenue-widget.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './analytics-gross-revenue-widget.scss'
})
export class AnalyticsGrossRevenueWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  content = input<any>();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
