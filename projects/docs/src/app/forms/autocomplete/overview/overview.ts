import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Playground } from '@meta/playground/playground';
import { map, Observable, startWith } from 'rxjs';
import {
  AutocompleteFilterExample
} from '../_examples/autocomplete-filter-example/autocomplete-filter-example';
import {
  SimpleAutocompleteExample
} from '../_examples/simple-autocomplete-example/simple-autocomplete-example';
import {
  SeparateControlsAndDisplayValuesExample
} from '../_examples/separate-controls-and-display-values-example/separate-controls-and-display-values-example';
import {
  AutoHighlightFirstPersonExample
} from '../_examples/auto-highlight-first-person-example/auto-highlight-first-person-example';
import { OptionGroupsExample } from '../_examples/option-groups-example/option-groups-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    ReactiveFormsModule,
    Playground,
    AutocompleteFilterExample,
    SimpleAutocompleteExample,
    SeparateControlsAndDisplayValuesExample,
    AutoHighlightFirstPersonExample,
    OptionGroupsExample,
    Page,
    PageContentDirective,
    PageTitleDirective
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {
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
