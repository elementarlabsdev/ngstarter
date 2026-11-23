import { toObservable } from '@angular/core/rxjs-interop';
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { Autocomplete, AutocompleteTrigger, Option } from '@ngstarter-ui/components/autocomplete';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { map, Observable, startWith } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-autocomplete-filter-example',
  imports: [
    FormField,
    Input,
    Autocomplete,
    Option,
    AutocompleteTrigger,
    SignalFormField,
    Label,
    AsyncPipe
  ],
  templateUrl: './autocomplete-filter-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './autocomplete-filter-example.scss'
})
export class AutocompleteFilterExample {
  myControl = form(signal(''));
  private readonly myControlChanges = toObservable(this.myControl().value);
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]>;

  ngOnInit() {
    this.filteredOptions = this.myControlChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }
}
