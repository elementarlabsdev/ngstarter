import { Component } from '@angular/core';
import { ChipListbox, ChipOption } from '@ngstarter-ui/components/chips';

@Component({
  selector: 'app-basic-chips-example',
  imports: [
    ChipOption,
    ChipListbox
  ],
  templateUrl: './basic-chips-example.html',
  styleUrl: './basic-chips-example.scss'
})
export class BasicChipsExample {

}
