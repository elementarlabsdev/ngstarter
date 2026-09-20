import { Component, inject, input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { GRID, Grid } from '@ngstarter-ui/components/grid';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-analytics-pending-projects-content',
  imports: [
    Icon,

  ],
  templateUrl: './analytics-pending-projects-widget.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './analytics-pending-projects-widget.scss'
})
export class AnalyticsPendingProjectsWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  widget = input<any>();

  ngOnInit() {
    if (this._grid && this.widget()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
