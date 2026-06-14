import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  imports: [
    Button,
    RouterLink
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {
}
