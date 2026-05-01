import { Component } from '@angular/core';
import { Toolbar, ToolbarTitle, ToolbarSpacer, ToolbarItem } from '@ngstarter/components/toolbar';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { ResizableContainer } from '@ngstarter/components/resizable-container';

@Component({
  selector: 'toolbar-overflow-example',
  templateUrl: './toolbar-overflow-example.html',
  standalone: true,
  imports: [Toolbar, ToolbarTitle, ToolbarSpacer, ToolbarItem, Button, Icon, ResizableContainer],
})
export class ToolbarOverflowExample {}
