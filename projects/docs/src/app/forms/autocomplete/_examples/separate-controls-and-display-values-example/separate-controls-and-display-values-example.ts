import { Component } from '@angular/core';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { AsyncPipe } from '@angular/common';
import { Autocomplete, AutocompleteTrigger, Option } from '@ngstarter-ui/components/autocomplete';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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
        ReactiveFormsModule,
        Option,
        Input,
        Label
    ],
    templateUrl: './separate-controls-and-display-values-example.html',
    styleUrl: './separate-controls-and-display-values-example.scss'
})
export class SeparateControlsAndDisplayValuesExample {
  myControl = new FormControl<string | User>('');
  options: User[] = [{name: 'Mary'}, {name: 'Shelley'}, {name: 'Igor'}];
  filteredOptions: Observable<User[]>;

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string) : this.options.slice();
      }),
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
