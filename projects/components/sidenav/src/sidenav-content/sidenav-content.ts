import {
  ChangeDetectionStrategy,
  Component,
  inject,
  afterNextRender,
  signal,
  NgZone,
} from '@angular/core';
import { SidenavContainer } from '../sidenav-container/sidenav-container';

@Component({
  selector: 'ngs-sidenav-content',
  exportAs: 'ngsSidenavContent',
  standalone: true,
  imports: [],
  templateUrl: './sidenav-content.html',
  styleUrl: './sidenav-content.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-sidenav-content',
    '[class.is-settled]': '_isSettled()',
    '[style.margin-left]': '_container._getContentMarginLeft()',
    '[style.margin-right]': '_container._getContentMarginRight()',
  },
})
export class SidenavContent {
  private _ngZone = inject(NgZone);
  protected _container = inject(SidenavContainer);
  protected _isSettled = signal(false);

  constructor() {
    afterNextRender(() => {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this._isSettled.set(true);
        }, 100);
      });
    });
  }
}
