import { toObservable } from '@angular/core/rxjs-interop';
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { AsyncPipe } from '@angular/common';
import { Autocomplete, AutocompleteTrigger, Option } from '@ngstarter-ui/components/autocomplete';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { Input } from '@ngstarter-ui/components/input';
import { map, Observable, startWith } from 'rxjs';

export interface User {
  name: string;
}

@Component({
    selector: 'app-separate-controls-and-display-values-example',
    imports: [
        FormField,
        AsyncPipe,
        Autocomplete,
        AutocompleteTrigger,
        SignalFormField,
        Option,
        Input,
        Label
    ],
    templateUrl: './separate-controls-and-display-values-example.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './separate-controls-and-display-values-example.scss'
})
export class SeparateControlsAndDisplayValuesExample {
  myControl = form(signal(''));
  private readonly myControlChanges = toObservable(this.myControl().value);
  options: User[] = [{name: 'Mary'}, {name: 'Shelley'}, {name: 'Igor'}];
  filteredOptions: Observable<User[]>;

  ngOnInit() {
    this.filteredOptions = this.myControlChanges.pipe(
      startWith(''),
      map(name => name ? this._filter(name) : this.options.slice()),
    );
  }

  displayFn(user: User): string {
    return user && user.name ? user.name : '';
  }

  private _filter(name: string): User[] {
    const filterValue = name.toLowerCase();

    return this.options.filter(option => option.name.toLowerCase().includes(filterValue));
  }
}
