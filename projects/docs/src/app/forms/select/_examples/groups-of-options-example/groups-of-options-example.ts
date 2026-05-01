import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Option, Select, Optgroup } from '@ngstarter/components/select';
import { Label } from '@ngstarter/components/form-field';
import { FormField } from '@ngstarter/components/form-field';

interface Pokemon {
  value: string;
  viewValue: string;
}

interface PokemonGroup {
  disabled?: boolean;
  name: string;
  pokemon: Pokemon[];
}

@Component({
  selector: 'app-groups-of-options-example',
  imports: [
    ReactiveFormsModule,
    Option,
    Select,
    Optgroup,
    Label,
    FormField
  ],
  templateUrl: './groups-of-options-example.html',
  styleUrl: './groups-of-options-example.scss'
})
export class GroupsOfOptionsExample {
  pokemonControl = new FormControl('');
  pokemonGroups: PokemonGroup[] = [
    {
      name: 'Grass',
      pokemon: [
        { value: 'bulbasaur-0', viewValue: 'Bulbasaur' },
        { value: 'oddish-1', viewValue: 'Oddish' },
        { value: 'bellsprout-2', viewValue: 'Bellsprout' },
      ],
    },
    {
      name: 'Water',
      pokemon: [
        { value: 'squirtle-3', viewValue: 'Squirtle' },
        { value: 'psyduck-4', viewValue: 'Psyduck' },
        { value: 'horsea-5', viewValue: 'Horsea' },
      ],
    },
    {
      name: 'Fire',
      disabled: true,
      pokemon: [
        { value: 'charmander-6', viewValue: 'Charmander' },
        { value: 'vulpix-7', viewValue: 'Vulpix' },
        { value: 'flareon-8', viewValue: 'Flareon' },
      ],
    },
    {
      name: 'Psychic',
      pokemon: [
        { value: 'mew-9', viewValue: 'Mew' },
        { value: 'mewtwo-10', viewValue: 'Mewtwo' },
      ],
    },
  ];
}
