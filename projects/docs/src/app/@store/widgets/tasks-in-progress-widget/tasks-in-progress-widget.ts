import { Component, inject, input, OnInit } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { Avatar } from '@ngstarter/components/avatar';
import { GRID, Grid } from '@ngstarter/components/grid';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'ngs-tasks-in-progress-content',
  imports: [
    Icon,
    Avatar,
    Button
  ],
  templateUrl: './tasks-in-progress-widget.html',
  styleUrl: './tasks-in-progress-widget.scss'
})
export class TasksInProgressWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  content = input();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
