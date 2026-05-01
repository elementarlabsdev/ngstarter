import { Component, inject, input, OnInit } from '@angular/core';
import { GRID, Grid } from '@ngstarter/components/grid';
import { Icon } from '@ngstarter/components/icon';

@Component({
  selector: 'app-analytics-total-projects-content',
  imports: [

    Icon
  ],
  templateUrl: './analytics-total-projects-widget.html',
  styleUrl: './analytics-total-projects-widget.scss'
})
export class AnalyticsTotalProjectsWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  widget = input<any>();

  ngOnInit() {
    if (this._grid && this.widget()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
