import { Component, inject, input, OnInit } from '@angular/core';
import { GRID, Grid } from '@ngstarter-ui/components/grid';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-analytics-likes-content',
  imports: [
    Icon
  ],
  templateUrl: './analytics-likes-widget.html',
  styleUrl: './analytics-likes-widget.scss'
})
export class AnalyticsLikesWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  content = input<any>();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
