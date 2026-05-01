import { Component, forwardRef, input, OnInit } from '@angular/core';
import { RAIL_NAV, RailNavAPI } from '../types';

@Component({
  selector: 'ngs-rail-nav',
  exportAs: 'ngsRailNav',
  imports: [],
  templateUrl: './rail-nav.html',
  styleUrl: './rail-nav.scss',
  providers: [
    {
      provide: RAIL_NAV,
      useExisting: forwardRef(() => RailNav),
    }
  ],
  host: {
    'class': 'ngs-rail-nav'
  }
})
export class RailNav implements OnInit {
  activeKey = input();

  private _activeKey: any;

  readonly api: RailNavAPI = {
    activateItem: (key: any) => {
      this._activeKey = key;
    },
    getActiveKey: () => this._activeKey,
    isActive: (key: any) => key === this._activeKey,
  };

  ngOnInit() {
    this._activeKey = this.activeKey();
  }
}
