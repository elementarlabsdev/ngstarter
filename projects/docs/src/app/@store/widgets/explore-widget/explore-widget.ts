import { Component, inject, input, OnInit } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { GRID, Grid } from '@ngstarter-ui/components/grid';
import { Ripple } from '@ngstarter-ui/components/core';

export interface ExploreWidget {
  title: string;
  description: string;
  iconName: string;
}

@Component({
  selector: 'ngs-explore-content',
  exportAs: 'ngsExploreWidget',
  imports: [
    Icon,
    Ripple,
  ],
  templateUrl: './explore-widget.html',
  styleUrl: './explore-widget.css'
})
export class ExploreWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  content = input.required<ExploreWidget>();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
