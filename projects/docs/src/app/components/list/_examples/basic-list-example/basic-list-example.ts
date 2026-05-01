import { Component } from '@angular/core';
import { List, ListItem } from '@ngstarter-ui/components/list';

@Component({
  selector: 'app-basic-list-example',
  imports: [
    ListItem,
    List
  ],
  templateUrl: './basic-list-example.html',
  styleUrl: './basic-list-example.scss'
})
export class BasicListExample {

}
