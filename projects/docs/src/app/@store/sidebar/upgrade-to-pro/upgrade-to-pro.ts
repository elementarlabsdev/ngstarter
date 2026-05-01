import { Component } from '@angular/core';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { Avatar } from '@ngstarter/components/avatar';

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
