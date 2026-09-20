import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Avatar } from '@ngstarter-ui/components/avatar';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'ngs-sidebar-toolbar-a',
  imports: [
    Icon,
    Button,
    Avatar
  ],
  templateUrl: './toolbar.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './toolbar.scss'
})
export class ToolbarA {

}
