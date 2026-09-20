import { Component, inject, input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { RouterLink } from '@angular/router';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemMeta,
  ListItemTitle
} from '@ngstarter-ui/components/list';
import { GRID } from '@ngstarter-ui/components/grid';

@Component({
  selector: 'ngs-my-investments',
  imports: [
    Icon,
    RouterLink,
    ListItem,
    List,
    ListItemAvatar,
    ListItemTitle,
    ListItemMeta
  ],
  templateUrl: './my-investments.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './my-investments.scss'
})
export class MyInvestments implements OnInit {
  private _grid = inject<any>(GRID, { optional: true });

  id = input.required<any>();
  content = input();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
