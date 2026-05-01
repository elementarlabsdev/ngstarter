import { Component } from '@angular/core';
import { List, ListItem, ListItemTitle } from '@ngstarter/components/list';

@Component({
  selector: 'app-list-variants-example',
  imports: [
    ListItemTitle,
    ListItem,
    List
  ],
  templateUrl: './list-variants-example.html',
  styleUrl: './list-variants-example.scss'
})
export class ListVariantsExample {

}
