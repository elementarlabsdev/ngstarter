import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    Button,
  ],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {}
