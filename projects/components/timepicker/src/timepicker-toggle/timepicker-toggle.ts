import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  input,
  contentChildren
} from '@angular/core';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { Timepicker } from '../timepicker/timepicker';
import { Subject } from 'rxjs';
import { TimepickerToggleIcon } from '../timepicker-toggle-icon';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'ngs-timepicker-toggle',
  exportAs: 'ngsTimepickerToggle',
  standalone: true,
  imports: [Button],
  templateUrl: './timepicker-toggle.html',
  styleUrl: './timepicker-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-timepicker-toggle',
    '[class.ngs-timepicker-toggle-active]': 'timepicker()?.isOpen()',
  },
})
export class TimepickerToggle implements OnDestroy {
  private _stateChanges = new Subject<void>();

  customIcons = contentChildren(TimepickerToggleIcon, { descendants: true });

  timepicker = input<Timepicker | null>(null, {
    alias: 'for'
  });
  disabled = input<boolean, BooleanInput>(false, {
    transform: coerceBooleanProperty
  });

  ngOnDestroy() {
    this._stateChanges.complete();
  }

  _open(event: Event): void {
    const timepicker = this.timepicker();
    const timepickerDisabled = typeof timepicker?.disabled === 'function' ? timepicker.disabled() : timepicker?.disabled;
    const disabled = this.disabled() || timepickerDisabled;

    if (timepicker && !disabled) {
      timepicker.open();
      event.stopPropagation();
    }
  }
}
