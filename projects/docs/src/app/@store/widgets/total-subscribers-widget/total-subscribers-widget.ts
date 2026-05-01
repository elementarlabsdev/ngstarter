import { Component, inject, input, OnInit } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import { Grid, GRID } from '@ngstarter-ui/components/grid';
import { Ripple } from '@ngstarter-ui/components/core';

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
