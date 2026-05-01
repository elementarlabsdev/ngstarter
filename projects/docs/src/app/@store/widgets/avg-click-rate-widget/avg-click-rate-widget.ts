import { Component, inject, input, OnInit } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import { GRID, Grid } from '@ngstarter-ui/components/grid';
import { Ripple } from '@ngstarter-ui/components/core';

@Component({
  selector: 'ngs-avg-click-rate-content',
  imports: [
    Icon,
    Tooltip,
    Ripple
  ],
  templateUrl: './avg-click-rate-widget.html',
  styleUrl: './avg-click-rate-widget.scss'
})
export class AvgClickRateWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  content = input<any>();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
