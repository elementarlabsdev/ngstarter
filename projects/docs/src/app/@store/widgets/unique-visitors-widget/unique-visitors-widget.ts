import { Component, inject, input, OnInit } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { Tooltip } from '@ngstarter/components/tooltip';
import { GRID, Grid } from '@ngstarter/components/grid';
import { Ripple } from '@ngstarter/components/core';

@Component({
  selector: 'ngs-unique-visitors-content',
  imports: [
    Icon,
    Tooltip,
    Ripple
  ],
  templateUrl: './unique-visitors-widget.html',
  styleUrl: './unique-visitors-widget.scss'
})
export class UniqueVisitorsWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  content = input();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
