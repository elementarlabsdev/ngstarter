import { Component } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { Button } from '@ngstarter-ui/components/button';

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
