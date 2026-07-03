import {
  Component,
  ChangeDetectionStrategy,
  input,
  inject,
  contentChild,
} from '@angular/core';
import { DatepickerIntl } from '../datepicker-intl';
import { DatepickerToggleIcon } from './datepicker-toggle-icon';
import type { Datepicker } from '../datepicker/datepicker';
import type { DateRangePicker } from '../date-range-picker/date-range-picker';
import { Button } from '@ngstarter-ui/components/button';
import { FORM_FIELD, FormField } from '@ngstarter-ui/components/form-field';

@Component({
  selector: 'ngs-datepicker-toggle',
  exportAs: 'ngsDatepickerToggle',
  templateUrl: './datepicker-toggle.html',
  styleUrl: './datepicker-toggle.scss',
  imports: [
    Button
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-datepicker-toggle',
  },
})
export class DatepickerToggle<D> {
  private _intl = inject(DatepickerIntl);
  private _formField = inject<FormField>(FORM_FIELD, { optional: true });

  readonly for = input<Datepicker<D> | DateRangePicker<D> | null>(null); // Reference to the datepicker

  readonly customIcon = contentChild(DatepickerToggleIcon);

  _open(event: MouseEvent): void {
    const datepicker = this.for();

    if (datepicker) {
      datepicker.open();
      event.stopPropagation();
    }
  }
}
