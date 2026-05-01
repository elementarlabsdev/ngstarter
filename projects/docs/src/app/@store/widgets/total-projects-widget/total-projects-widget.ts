import { Component, inject, input, OnInit } from '@angular/core';
import {
  MchartLine, MchartTooltipBody,
  MchartTooltip,
  MchartTooltipTitle
} from '@ngstarter-ui/components/micro-chart';
import { Grid, GRID } from '@ngstarter-ui/components/grid';

@Component({
  selector: 'ngs-total-projects-content',
  imports: [
    MchartLine,
    MchartTooltip,
    MchartTooltipTitle,
    MchartTooltipBody
  ],
  templateUrl: './total-projects-widget.html',
  styleUrl: './total-projects-widget.scss'
})
export class TotalProjectsWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  data = [47, 54, 38, 24, 65, 37];
  labels = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

  id = input.required<any>();
  content = input();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
