import { DateRange } from './date-range';

export interface DatepickerPreset<D> {
  label: string;
  value: D | DateRange<D> | null;
}
