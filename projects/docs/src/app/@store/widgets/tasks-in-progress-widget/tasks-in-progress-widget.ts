import { Component, inject, input, OnInit } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Avatar } from '@ngstarter-ui/components/avatar';
import { GRID, Grid } from '@ngstarter-ui/components/grid';
import { Button } from '@ngstarter-ui/components/button';

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
