import { Component, inject, input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { GRID, Grid } from '@ngstarter-ui/components/grid';

@Component({
  selector: 'app-analytics-active-users-content',
  imports: [],
  templateUrl: './analytics-active-users-widget.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './analytics-active-users-widget.scss'
})
export class AnalyticsActiveUsersWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  content = input<any>();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
