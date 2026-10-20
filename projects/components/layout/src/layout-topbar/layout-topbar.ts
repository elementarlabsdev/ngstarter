import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-layout-topbar',
  exportAs: 'ngsLayoutTopbar',
  templateUrl: './layout-topbar.html',
  styleUrl: './layout-topbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-layout-topbar'
  }
})
export class LayoutTopbar {

}
