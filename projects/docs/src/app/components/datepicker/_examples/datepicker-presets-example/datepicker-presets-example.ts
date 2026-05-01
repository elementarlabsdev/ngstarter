import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormField, IconButtonSuffix, Label } from '@ngstarter-ui/components/form-field';
import {
  DateRangeInput,
  DateRangePicker,
  DatepickerToggle,
  DatepickerPreset,
  DateRange,
  StartDate,
  EndDate
} from '@ngstarter-ui/components/datepicker';

@Component({
  selector: 'app-datepicker-presets-example',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormField,
    Label,
    DateRangeInput,
    DateRangePicker,
    DatepickerToggle,
    StartDate,
    EndDate,
    IconButtonSuffix
  ],
  templateUrl: './datepicker-presets-example.html',
})
export class DatepickerPresetsExample {
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  rangeCustom = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  customPresets: DatepickerPreset<Date>[] = [
    {
      label: 'Yesterday',
      value: () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return new DateRange(d, d);
      }
    },
    {
      label: 'Next 7 Days',
      value: () => {
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + 7);
        return new DateRange(start, end);
      }
    }
  ].map(p => ({
    ...p,
    value: typeof p.value === 'function' ? p.value() : p.value
  }));
}
