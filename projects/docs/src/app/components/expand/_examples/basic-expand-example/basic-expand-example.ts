import { Component } from '@angular/core';
import { Expand } from '@ngstarter-ui/components/expand';

@Component({
  selector: 'app-basic-expand-example',
  imports: [
    Expand
  ],
  templateUrl: './basic-expand-example.html',
  styleUrl: './basic-expand-example.scss'
})
export class BasicExpandExample {
  expanded = false;
}
