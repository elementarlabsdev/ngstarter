import {
  booleanAttribute,
  Component, DestroyRef,
  inject,
  input,
  OnChanges, OnInit, output,
  SimpleChanges
} from '@angular/core';
import { TabPanelApiService } from '../tab-panel-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ngs-tab-panel',
  exportAs: 'ngsTabPanel',
  templateUrl: './tab-panel.html',
  styleUrl: './tab-panel.scss',
  providers: [
    TabPanelApiService
  ],
  host: {
    'class': 'ngs-tab-panel',
    '[class.is-hide-content-if-tab-not-selected]': 'hideContentIfTabNotSelected()',
    '[class.is-compact]': 'compact()',
  }
})
export class TabPanel implements OnInit, OnChanges {
  private _destroyRef = inject(DestroyRef);
  readonly api = inject(TabPanelApiService);

  hideContentIfTabNotSelected = input(false, {
    transform: booleanAttribute
  });
  activeItemId = input<any>();
  compact = input(false, {
    transform: booleanAttribute
  });

  readonly itemIdChanged = output();

  ngOnInit() {
    this.api
      .itemIdChanged
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this.itemIdChanged.emit();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activeItemId']) {
      this.api.activate(changes['activeItemId'].currentValue);
    }
  }
}
