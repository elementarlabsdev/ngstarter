import { Component } from '@angular/core';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { Autocomplete, AutocompleteTrigger, Option } from '@ngstarter-ui/components/autocomplete';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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
    ReactiveFormsModule,
    Label,
    AsyncPipe
  ],
  templateUrl: './autocomplete-filter-example.html',
  styleUrl: './autocomplete-filter-example.scss'
})
export class AutocompleteFilterExample {
  myControl = new FormControl('');
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]>;

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }
}
