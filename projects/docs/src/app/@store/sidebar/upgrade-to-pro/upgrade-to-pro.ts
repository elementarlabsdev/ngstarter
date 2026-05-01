import { Component } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { Avatar } from '@ngstarter-ui/components/avatar';

@Component({
  selector: 'ngs-sidebar-upgrade-to-pro',
  exportAs: 'appSidebarUpgradeToPro',
  imports: [
    Button,
    Icon,
    Avatar
  ],
  templateUrl: './upgrade-to-pro.html',
  styleUrl: './upgrade-to-pro.scss'
})
export class UpgradeToPro {

}
