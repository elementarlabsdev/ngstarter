import { Component, inject, input, OnInit } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { Grid, GRID } from '@ngstarter/components/grid';

@Component({
  selector: 'ngs-customer-satisfaction-content',
  imports: [
    Icon
  ],
  templateUrl: './customer-satisfaction-widget.html',
  styleUrl: './customer-satisfaction-widget.scss'
})
export class CustomerSatisfactionWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  content = input();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
