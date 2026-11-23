import { toObservable } from '@angular/core/rxjs-interop';
import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { Autocomplete, Option, AutocompleteTrigger } from '@ngstarter-ui/components/autocomplete';
import { map, Observable, startWith } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-simple-autocomplete-example',
  imports: [
    SignalFormField,
    Label,
    FormField,
    Option,
    Autocomplete,
    Input,
    AutocompleteTrigger,
    AsyncPipe
  ],
  templateUrl: './simple-autocomplete-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './simple-autocomplete-example.scss'
})
export class SimpleAutocompleteExample implements OnInit {
  myControl = form(signal(''));
  private readonly myControlChanges = toObservable(this.myControl().value);
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions!: Observable<string[]>;

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
