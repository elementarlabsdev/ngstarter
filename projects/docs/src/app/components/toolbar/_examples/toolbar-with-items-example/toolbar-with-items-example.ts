import { Component } from '@angular/core';
import { Toolbar, ToolbarTitle, ToolbarSpacer, ToolbarItem } from '@ngstarter/components/toolbar';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';

@Component({
  selector: 'toolbar-with-items-example',
  templateUrl: './toolbar-with-items-example.html',
  styleUrl: './toolbar-with-items-example.scss',
  standalone: true,
  imports: [Toolbar, ToolbarTitle, ToolbarSpacer, ToolbarItem, Button, Icon],
})
export class ToolbarWithItemsExample {}
