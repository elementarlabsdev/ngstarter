import { Component } from '@angular/core';
import { ListOption, SelectionList } from '@ngstarter/components/list';
import { Divider } from '@ngstarter/components/divider';

@Component({
  selector: 'app-list-with-single-selection-example',
  imports: [
    ListOption,
    SelectionList,
    Divider
  ],
  templateUrl: './list-with-single-selection-example.html',
  styleUrl: './list-with-single-selection-example.scss'
})
export class ListWithSingleSelectionExample {
  typesOfShoes: string[] = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];
}
