import { Component, ChangeDetectionStrategy } from '@angular/core';
import { List, ListItem, ListItemTitle } from '@ngstarter-ui/components/list';

@Component({
  selector: 'app-list-variants-example',
  imports: [
    ListItemTitle,
    ListItem,
    List
  ],
  templateUrl: './list-variants-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './list-variants-example.scss'
})
export class ListVariantsExample {

}
