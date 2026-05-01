import { Component, inject, input, OnInit } from '@angular/core';
import { GRID } from '@ngstarter/components/grid';

@Component({
  selector: 'ngs-recent-activity-content',
  imports: [],
  templateUrl: './recent-activity-widget.html',
  styleUrl: './recent-activity-widget.scss'
})
export class RecentActivityWidget implements OnInit {
  private _grid = inject<any>(GRID, { optional: true });

  id = input.required<any>();
  content = input();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
