import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'app-not-found',
  imports: [
    RouterLink,
    Button
  ],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss'
})
export class NotFound {

}
