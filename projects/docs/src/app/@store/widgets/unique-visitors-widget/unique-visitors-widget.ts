import { Component, inject, input, OnInit } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import { GRID, Grid } from '@ngstarter-ui/components/grid';
import { Ripple } from '@ngstarter-ui/components/core';

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
