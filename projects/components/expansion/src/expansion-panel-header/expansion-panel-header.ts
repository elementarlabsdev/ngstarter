import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Host,
  input,
  booleanAttribute,
  inject
} from '@angular/core';
import { ExpansionPanel } from '../expansion-panel/expansion-panel';

@Component({
  selector: 'ngs-expansion-panel-header',
  exportAs: 'ngsExpansionPanelHeader',
  templateUrl: './expansion-panel-header.html',
  styleUrl: './expansion-panel-header.scss',
  host: {
    'class': 'ngs-expansion-panel-header',
    'role': 'button',
    '[attr.id]': 'panel.headerId',
    '[attr.tabindex]': 'panel.disabled() ? -1 : 0',
    '[attr.aria-controls]': 'panel.id',
    '[attr.aria-expanded]': 'panel.expanded()',
    '[attr.aria-disabled]': 'panel.disabled()',
    '[class.ngs-expanded]': 'panel.expanded()',
    '(click)': '_toggle()',
    '(keydown.enter)': '_toggle()',
    '(keydown.space)': '_toggle()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpansionPanelHeader {
  readonly panel = inject(ExpansionPanel);
  private _cdr = inject(ChangeDetectorRef);

  hideToggle = input(false, {
    transform: booleanAttribute
  });

  _toggle(): void {
    if (!this.panel.disabled()) {
      this.panel.toggle();
      this._cdr.markForCheck();

      if (this.panel.accordion) {
        this.panel.accordion._cdr.markForCheck();
      }
    }
  }

  _getExpandedState(): string {
    return this.panel._getExpandedState();
  }
}
