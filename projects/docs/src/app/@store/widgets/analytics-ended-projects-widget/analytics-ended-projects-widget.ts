import { Component, inject, input, OnInit } from '@angular/core';
import { GRID, Grid } from '@ngstarter-ui/components/grid';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-analytics-ended-projects-content',
  imports: [
    Icon,

  ],
  templateUrl: './analytics-ended-projects-widget.html',
  styleUrl: './analytics-ended-projects-widget.scss'
})
export class AnalyticsEndedProjectsWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  content = input<any>();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
