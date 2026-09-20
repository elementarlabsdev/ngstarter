import { Component, ChangeDetectionStrategy } from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    Button,
    RouterLinkActive,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {}
