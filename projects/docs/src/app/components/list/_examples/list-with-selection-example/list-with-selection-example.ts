import { Component } from '@angular/core';
import { Divider } from '@ngstarter/components/divider';
import { ListOption, SelectionList } from '@ngstarter/components/list';

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
  typesOfShoes: string[] = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];
}
