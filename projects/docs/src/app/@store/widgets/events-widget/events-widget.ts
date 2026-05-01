import { Component, inject, input, OnInit } from '@angular/core';
import {
  Avatar,
  AvatarGroup,
  AvatarMore,
} from '@ngstarter-ui/components/avatar';
import { GRID, Grid } from '@ngstarter-ui/components/grid';

@Component({
  selector: 'ngs-events-content',
  templateUrl: './events-widget.html',
  imports: [
    AvatarGroup,
    Avatar,
    AvatarMore
  ],
  styleUrl: './events-widget.scss'
})
export class EventsWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  content = input<any>();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
