import { Component, inject, input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GRID } from '@ngstarter/components/grid';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'ngs-current-plan-content',
  imports: [
    RouterLink,
    Button
  ],
  templateUrl: './current-plan-widget.html',
  styleUrl: './current-plan-widget.scss'
})
export class CurrentPlanWidget implements OnInit {
  private _grid = inject<any>(GRID, { optional: true });

  id = input.required<any>();
  content = input<any>();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
