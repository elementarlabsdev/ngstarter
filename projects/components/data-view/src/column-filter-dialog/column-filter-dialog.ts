import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DIALOG_DATA, DialogRef, DialogTitle, DialogContent, DialogActions } from '@ngstarter-ui/components/dialog';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label, IconButtonSuffix } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { Select, Option } from '@ngstarter-ui/components/select';
import { NumberInput } from '@ngstarter-ui/components/number-input';
import { DateRange, DateAdapter, DateRangeInput, DateRangePicker, StartDate, EndDate, DatepickerToggle, provideNativeDateAdapter } from '@ngstarter-ui/components/datepicker';
import { Alert } from '@ngstarter-ui/components/alert';
import { DataViewColumnDef, DataViewColumnFilter } from '../types';
import { dataViewDateKey, normalizeDataViewFilter } from '../filters';

export interface DataViewFilterDialogData { column: DataViewColumnDef; filter?: DataViewColumnFilter; }
@Component({
  selector: 'ngs-data-view-column-filter-dialog',
  templateUrl: './column-filter-dialog.html',
  imports: [FormsModule, DialogTitle, DialogContent, DialogActions, Button, FormField, Label,
    Input, Select, Option, NumberInput, DateRangeInput, DateRangePicker, StartDate, EndDate,
    DatepickerToggle, IconButtonSuffix, Alert],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataViewColumnFilterDialog {
  private readonly data = inject<DataViewFilterDialogData>(DIALOG_DATA);
  private readonly dialog = inject<DialogRef<DataViewColumnFilterDialog, { filter: DataViewColumnFilter | null }>>(DialogRef);
  readonly column = this.data.column;
  readonly type = this.column.filter!.type;
  readonly options = this.column.filter?.options ?? [];
  readonly error = signal<string | null>(null);
  readonly operator = signal(this.data.filter && 'operator' in this.data.filter ? this.data.filter.operator : this.type === 'text' ? 'contains' : 'equals');
  readonly text = signal(this.data.filter?.type === 'text' ? this.data.filter.value : '');
  readonly value = signal<number | null>(this.data.filter?.type === 'number' ? this.data.filter.value ?? null : null);
  readonly to = signal<number | null>(this.data.filter?.type === 'number' ? this.data.filter.to ?? null : null);
  readonly enumValues = signal<(string | number)[]>(this.data.filter?.type === 'enum' ? this.data.filter.values : []);
  readonly booleanValue = signal<boolean | null>(this.data.filter?.type === 'boolean' ? this.data.filter.value : null);
  private readonly dateAdapter = inject<DateAdapter<Date>>(DateAdapter);
  readonly dateRange = signal<DateRange<Date> | null>(this.data.filter?.type === 'date' ? new DateRange(
    this.data.filter.from ? new Date(`${this.data.filter.from}T00:00:00`) : null,
    this.data.filter.to ? new Date(`${this.data.filter.to}T00:00:00`) : null) : null);
  readonly invalidDate = computed(() => [this.dateRange()?.start, this.dateRange()?.end].some(date => date && !this.dateAdapter.isValid(date)));
  readonly textOperators = [{ value: 'contains', label: 'Contains' }, { value: 'equals', label: 'Equals' }, { value: 'startsWith', label: 'Starts with' }, { value: 'endsWith', label: 'Ends with' }, { value: 'notContains', label: 'Does not contain' }];
  readonly numberOperators = [{ value: 'equals', label: 'Equals' }, { value: 'notEquals', label: 'Does not equal' }, { value: 'greaterThan', label: 'Greater than' }, { value: 'lessThan', label: 'Less than' }, { value: 'between', label: 'Between' }];
  apply(): void {
    try {
      if (this.invalidDate()) { this.error.set('Enter a valid calendar date'); return; }
      let filter: DataViewColumnFilter | null;
      switch (this.type) {
        case 'text': filter = { type: 'text', operator: this.operator() as any, value: this.text() }; break;
        case 'number': filter = { type: 'number', operator: this.operator() as any, value: this.value() ?? undefined, to: this.to() ?? undefined }; break;
        case 'date': filter = { type: 'date', from: dataViewDateKey(this.dateRange()?.start), to: dataViewDateKey(this.dateRange()?.end) }; break;
        case 'enum': filter = { type: 'enum', values: this.enumValues() }; break;
        case 'boolean': filter = this.booleanValue() === null ? null : { type: 'boolean', value: this.booleanValue()! }; break;
      }
      this.dialog.close({ filter: filter ? normalizeDataViewFilter(filter) : null });
    } catch (error) { this.error.set(error instanceof Error ? error.message : 'Invalid filter'); }
  }
  clear(): void { this.dialog.close({ filter: null }); }
  cancel(): void { this.dialog.close(); }
}
