import {Component, signal} from '@angular/core';
import { Divider } from '@ngstarter-ui/components/divider';
import { ListOption, SelectionList } from '@ngstarter-ui/components/list';

@Component({
  selector: 'app-list-with-selection-example',
  imports: [
    Divider,
    ListOption,
    SelectionList
  ],
  templateUrl: './list-with-selection-example.html',
  styleUrl: './list-with-selection-example.scss'
})
export class ListWithSelectionExample {
  typesOfShoes = signal<string[]>(['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers']);
}
