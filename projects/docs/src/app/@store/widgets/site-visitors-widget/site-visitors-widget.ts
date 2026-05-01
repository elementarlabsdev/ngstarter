import { Component, inject, input, OnInit } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { GRID, Grid } from '@ngstarter-ui/components/grid';

@Component({
  selector: 'ngs-site-visitors-content',
  imports: [
    Icon
  ],
  templateUrl: './site-visitors-widget.html',
  styleUrl: './site-visitors-widget.scss'
})
export class SiteVisitorsWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  content = input();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
