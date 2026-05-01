import { Component, inject, input, OnInit } from '@angular/core';
import {
  MchartLine,
  MchartTooltipBody,
  MchartTooltip,
  MchartTooltipTitle
} from '@ngstarter/components/micro-chart';
import { Grid, GRID } from '@ngstarter/components/grid';

@Component({
  selector: 'ngs-total-tasks-content',
  templateUrl: './total-tasks-widget.html',
  imports: [
    MchartTooltipBody,
    MchartTooltip,
    MchartTooltipTitle,
    MchartLine
  ],
  styleUrl: './total-tasks-widget.scss'
})
export class TotalTasksWidget implements OnInit {
  data = [47, 54, 38, 24, 65, 37];
  labels = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  content = input();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
