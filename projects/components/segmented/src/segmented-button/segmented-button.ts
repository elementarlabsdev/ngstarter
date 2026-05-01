import {
  booleanAttribute,
  Component,
  inject,
  input
} from '@angular/core';
import { SEGMENTED } from '../types';
import { Segmented } from '../segmented/segmented';
import { Ripple } from '@ngstarter-ui/components/core';

@Component({
  selector: 'ngs-segmented-button,[ngs-segmented-button]',
  exportAs: 'ngsSegmentedButton',
  templateUrl: './segmented-button.html',
  styleUrl: './segmented-button.scss',
  hostDirectives: [
    Ripple
  ],
  host: {
    'class': 'ngs-segmented-button',
    '[class.icon-only]': 'iconOnly()',
    '[class.is-selected]': '_isSelected',
    '[class.is-disabled]': 'disabled() || null',
    '(click)': '_handleClick()',
  }
})
export class SegmentedButton {
  private _segmented = inject<Segmented>(SEGMENTED, { skipSelf: true });

  value = input.required<any>();
  disabled = input(false, {
    transform: booleanAttribute
  });
  iconOnly = input(false, {
    transform: booleanAttribute
  });

  get _isSelected(): boolean {
    return this._segmented.api.isSelected(this.value());
  }

  get api() {
    return {
      isSelected: () => this._isSelected
    }
  }

  protected _handleClick() {
    this._segmented.api.select(this.value());
  }
}
