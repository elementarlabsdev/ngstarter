import { Component, inject, signal } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ChipEdit, ChipEditedEvent, ChipGrid, ChipInput, ChipInputEvent, ChipRemove, ChipRow } from '@ngstarter/components/chips';
import { Label } from '@ngstarter/components/form-field';
import { FormField } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';

export interface Fruit {
  name: string;
}

@Component({
  selector: 'app-chips-with-input-example',
  imports: [
    ChipInput,
    Icon,
    ChipRemove,
    ChipRow,
    ChipGrid,
    ChipEdit,
    Label,
    FormField,
    Input
  ],
  templateUrl: './chips-with-input-example.html',
  styleUrl: './chips-with-input-example.scss'
})
export class ChipsWithInputExample {
  readonly addOnBlur = false;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  readonly fruits = signal<Fruit[]>([{name: 'Lemon'}, {name: 'Lime'}, {name: 'Apple'}]);
  readonly announcer = inject(LiveAnnouncer);

  add(event: ChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.fruits.update((fruits: Fruit[]) => [...fruits, {name: value}]);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(fruit: Fruit): void {
    this.fruits.update((fruits: Fruit[]) => {
      const index = fruits.indexOf(fruit);
      if (index < 0) {
        return fruits;
      }

      fruits.splice(index, 1);
      this.announcer.announce(`Removed ${fruit.name}`);
      return [...fruits];
    });
  }

  edit(fruit: Fruit, event: ChipEditedEvent) {
    const value = event.value.trim();

    // Remove fruit if it no longer has a name
    if (!value) {
      this.remove(fruit);
      return;
    }

    // Edit existing fruit
    this.fruits.update((fruits: Fruit[]) => {
      const index = fruits.indexOf(fruit);
      if (index >= 0) {
        fruits[index].name = value;
        return [...fruits];
      }
      return fruits;
    });
  }
}
