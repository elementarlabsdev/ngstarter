import { Component } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { Dicebear } from '@ngstarter/components/avatar';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'ngs-sidebar-toolbar-a',
  imports: [
    Icon,
    Button,
    Dicebear
  ],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss'
})
export class ToolbarA {

}
