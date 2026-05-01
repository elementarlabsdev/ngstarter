import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { Autocomplete, Option, AutocompleteTrigger } from '@ngstarter/components/autocomplete';
import { map, Observable, startWith } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-simple-autocomplete-example',
  imports: [
    ReactiveFormsModule,
    Label,
    FormField,
    Option,
    Autocomplete,
    Input,
    AutocompleteTrigger,
    AsyncPipe
  ],
  templateUrl: './simple-autocomplete-example.html',
  styleUrl: './simple-autocomplete-example.scss'
})
export class SimpleAutocompleteExample implements OnInit {
  myControl = new FormControl('');
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions!: Observable<string[]>;

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
