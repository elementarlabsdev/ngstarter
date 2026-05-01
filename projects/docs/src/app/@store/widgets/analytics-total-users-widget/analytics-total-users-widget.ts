import { Component, inject, input, OnInit } from '@angular/core';
import { GRID, Grid } from '@ngstarter-ui/components/grid';

@Component({
  selector: 'app-analytics-total-users-content',
  imports: [],
  templateUrl: './analytics-total-users-widget.html',
  styleUrl: './analytics-total-users-widget.scss'
})
export class AnalyticsTotalUsersWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  content = input<any>();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
