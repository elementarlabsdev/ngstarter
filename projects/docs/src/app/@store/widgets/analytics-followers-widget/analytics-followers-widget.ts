import { Component, inject, input, OnInit } from '@angular/core';
import { GRID, Grid } from '@ngstarter/components/grid';
import { Icon } from '@ngstarter/components/icon';

@Component({
  selector: 'app-analytics-followers-content',
  imports: [
    Icon
  ],
  templateUrl: './analytics-followers-widget.html',
  styleUrl: './analytics-followers-widget.scss'
})
export class AnalyticsFollowersWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  content = input<any>();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
