import { Component } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Badge } from '@ngstarter-ui/components/badge';
import { Button } from '@ngstarter-ui/components/button';

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
