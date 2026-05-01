import { Component, inject, input, OnInit } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Grid, GRID } from '@ngstarter-ui/components/grid';

@Component({
  selector: 'ngs-visit-duration-content',
  imports: [
    Icon
  ],
  templateUrl: './visit-duration-widget.html',
  styleUrl: './visit-duration-widget.scss'
})
export class VisitDurationWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  content = input();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
