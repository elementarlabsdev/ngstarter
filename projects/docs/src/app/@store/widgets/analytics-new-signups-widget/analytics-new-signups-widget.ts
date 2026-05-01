import { Component, inject, input, OnInit } from '@angular/core';
import { GRID, Grid } from '@ngstarter/components/grid';

@Component({
  selector: 'app-analytics-new-signups-content',
  imports: [],
  templateUrl: './analytics-new-signups-widget.html',
  styleUrl: './analytics-new-signups-widget.scss'
})
export class AnalyticsNewSignupsWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  content = input<any>();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
