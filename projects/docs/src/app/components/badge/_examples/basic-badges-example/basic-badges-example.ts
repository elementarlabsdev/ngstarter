import { Component } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { Badge } from '@ngstarter/components/badge';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'app-basic-badges-example',
  imports: [
    Icon,
    Badge,
    Button
  ],
  templateUrl: './basic-badges-example.html',
  styleUrl: './basic-badges-example.scss'
})
export class BasicBadgesExample {
  hidden = false;

  toggleBadgeVisibility() {
    this.hidden = !this.hidden;
  }
}
