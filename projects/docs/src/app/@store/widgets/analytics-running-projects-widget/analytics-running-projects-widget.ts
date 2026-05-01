import { Component, inject, input, OnInit } from '@angular/core';
import { GRID, Grid } from '@ngstarter/components/grid';
import { Icon } from '@ngstarter/components/icon';

@Component({
  selector: 'app-analytics-running-projects-content',
  imports: [
    Icon,

  ],
  templateUrl: './analytics-running-projects-widget.html',
  styleUrl: './analytics-running-projects-widget.scss'
})
export class AnalyticsRunningProjectsWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  content = input<any>();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
