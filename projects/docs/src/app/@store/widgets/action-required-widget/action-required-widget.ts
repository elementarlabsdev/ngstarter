import { Component, inject, input, OnInit } from '@angular/core';
import { ActionRequired } from '@ngstarter-ui/components/action-required';
import { GRID, Grid } from '@ngstarter-ui/components/grid';

export interface ActionRequiredWidget {
  iconName?: string;
  description: string;
  buttonText: string;
  actionText: string;
}

@Component({
  selector: 'ngs-action-required-content',
  exportAs: 'ngsActionRequiredWidget',
  imports: [
    ActionRequired
  ],
  templateUrl: './action-required-widget.html',
  styleUrl: './action-required-widget.css',
  host: {
    'class': 'ngs-action-required-content'
  }
})
export class ActionRequiredWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  content = input<ActionRequiredWidget>();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
