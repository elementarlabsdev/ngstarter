import { Component } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-upgrade',
  standalone: true,
  imports: [
    Button,
    Icon,
  ],
  templateUrl: './upgrade.component.html'
})
export class UpgradeComponent {}
