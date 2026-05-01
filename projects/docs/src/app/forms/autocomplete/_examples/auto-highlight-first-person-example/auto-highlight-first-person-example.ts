import { Component } from '@angular/core';
import { Autocomplete, AutocompleteTrigger, Option } from '@ngstarter/components/autocomplete';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { AsyncPipe } from '@angular/common';
import { map, Observable, startWith } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-auto-highlight-first-person-example',
  imports: [
    Autocomplete,
    Option,
    FormField,
    Input,
    AutocompleteTrigger,
    AsyncPipe,
    Label,
    ReactiveFormsModule
  ],
  templateUrl: './auto-highlight-first-person-example.html',
  styleUrl: './auto-highlight-first-person-example.scss'
})
export class AutoHighlightFirstPersonExample {
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
