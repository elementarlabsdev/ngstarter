import { Component, inject, input, OnInit } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { Avatar } from '@ngstarter/components/avatar';
import { GRID, Grid } from '@ngstarter/components/grid';

@Component({
  selector: 'ngs-team-content',
  imports: [
    Icon,

    Avatar
  ],
  templateUrl: './team-widget.html',
  styleUrl: './team-widget.scss'
})
export class TeamWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  widget = input();

  ngOnInit() {
    if (this._grid && this.widget()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
