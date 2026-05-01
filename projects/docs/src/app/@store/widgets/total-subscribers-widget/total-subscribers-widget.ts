import { Component, inject, input, OnInit } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { Tooltip } from '@ngstarter/components/tooltip';
import { Grid, GRID } from '@ngstarter/components/grid';
import { Ripple } from '@ngstarter/components/core';

@Component({
  selector: 'ngs-total-subscribers-content',
  imports: [
    Icon,
    Tooltip,
    Ripple
  ],
  templateUrl: './total-subscribers-widget.html',
  styleUrl: './total-subscribers-widget.scss'
})
export class TotalSubscribersWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  widget = input();

  ngOnInit() {
    if (this._grid && this.widget()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
