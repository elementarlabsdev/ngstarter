import { Component, inject, input, OnInit } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { GRID, Grid } from '@ngstarter-ui/components/grid';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'ngs-today-sales-content',
  imports: [
    Icon,
    Button,
  ],
  templateUrl: './today-sales-widget.html',
  styleUrl: './today-sales-widget.scss'
})
export class TodaySalesWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  widget = input();

  ngOnInit() {
    if (this._grid && this.widget()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
