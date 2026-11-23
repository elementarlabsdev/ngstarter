import { toObservable } from '@angular/core/rxjs-interop';
import { Component, ElementRef, inject, viewChild, ChangeDetectionStrategy, signal } from '@angular/core';
import {
  Autocomplete,
  AutocompleteTrigger,
  Option,
  AutocompleteSelectedEvent
} from '@ngstarter-ui/components/autocomplete';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { Icon } from '@ngstarter-ui/components/icon';
import { FormField } from '@ngstarter-ui/components/form-field';
import { map, Observable, startWith } from 'rxjs';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AsyncPipe } from '@angular/common';
import { ChipGrid, ChipInput, ChipRemove, ChipRow, ChipInputEvent } from '@ngstarter-ui/components/chips';
import { Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'app-chips-autocomplete-example',
  imports: [
    SignalFormField,
    Icon,
    FormField,
    Label,
    AsyncPipe,
    ChipRemove,
    ChipInput,
    ChipRow,
    ChipGrid,
    Autocomplete,
    Option,
    AutocompleteTrigger,
    Input
  ],
  templateUrl: './chips-autocomplete-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './chips-autocomplete-example.scss'
})
export class ChipsAutocompleteExample {
  separatorKeysCodes: number[] = [ENTER, COMMA];
  fruitCtrl = form(signal(''));
  private readonly fruitCtrlChanges = toObservable(this.fruitCtrl().value);
  filteredFruits: Observable<string[]>;
  fruits: string[] = ['Lemon'];
  allFruits: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];

  readonly fruitInput = viewChild.required<ElementRef<HTMLInputElement>>('fruitInput');

  announcer = inject(LiveAnnouncer);

  constructor() {
    this.filteredFruits = this.fruitCtrlChanges.pipe(
      startWith(null),
      map((fruit: string | null) => (fruit ? this._filter(fruit) : this.allFruits.slice())),
    );
  }

  add(event: ChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.fruits.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();
    this.fruitCtrl().value.set('');
  }

  remove(fruit: string): void {
    const index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);
      this.announcer.announce(`Removed ${fruit}`);
    }
  }

  selected(event: AutocompleteSelectedEvent): void {
    this.fruits.push(event.option.viewValue);
    this.fruitInput().nativeElement.value = '';
    this.fruitCtrl().value.set('');
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allFruits.filter(fruit => fruit.toLowerCase().includes(filterValue));
  }
}
