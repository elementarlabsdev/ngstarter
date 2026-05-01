import { Component, inject, input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GRID, Grid } from '@ngstarter/components/grid';

export interface HeadingWidget {
  title: string;
  viewMore?: {
    link: string;
    name: string;
    external: boolean;
  }
}

@Component({
  selector: 'ngs-heading-content',
  imports: [
    RouterLink
  ],
  templateUrl: './heading-widget.html',
  styleUrl: './heading-widget.css'
})
export class HeadingWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  content = input.required<HeadingWidget>();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }

  protected get external(): boolean {
    return this.content().viewMore?.external || false;
  }
}
