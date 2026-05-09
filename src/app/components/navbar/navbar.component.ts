import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    Button,
    Icon,
  ],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {}
