import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  input,
  output,
  booleanAttribute,
  inject,
  Optional,
  SkipSelf,
  model
} from '@angular/core';
import { Accordion } from '../accordion/accordion';

let nextId = 0;

@Component({
  selector: 'ngs-expansion-panel',
  exportAs: 'ngsExpansionPanel',
  templateUrl: './expansion-panel.html',
  styleUrl: './expansion-panel.scss',
  host: {
    'class': 'ngs-expansion-panel',
    '[class.ngs-expanded]': 'expanded()',
    '[class.ngs-expansion-panel-disabled]': 'disabled()',
    '[attr.id]': 'id',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpansionPanel {
  private _cdr = inject(ChangeDetectorRef);
  readonly accordion = inject(Accordion, { optional: true });

  disabled = input(false, {
    transform: booleanAttribute
  });

  expanded = model(false);

  hideToggle = input(false, {
    transform: booleanAttribute
  });

  readonly opened = output<void>();
  readonly closed = output<void>();
  readonly expandedChange = output<boolean>();

  readonly id = `ngs-expansion-panel-${nextId++}`;
  readonly headerId = `ngs-expansion-panel-header-${nextId++}`;

  toggle(): void {
    if (this.expanded()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    if (!this.expanded()) {
      this.expanded.set(true);
      this.opened.emit();
      this._emitExpansionChange();
    }
  }

  close(): void {
    if (this.expanded()) {
      this.expanded.set(false);
      this.closed.emit();
      this._emitExpansionChange();
    }
  }

  private _emitExpansionChange(): void {
    this.expandedChange.emit(this.expanded());
    this._cdr.markForCheck();
  }

  _getHideToggle(): boolean {
    return this.hideToggle() || (this.accordion?.hideToggle() ?? false);
  }

  _getExpandedState(): string {
    return this.expanded() ? 'expanded' : 'collapsed';
  }
}
