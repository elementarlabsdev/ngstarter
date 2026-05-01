import { Component } from '@angular/core';
import { Toolbar, ToolbarTitle, ToolbarSpacer, ToolbarItem } from '@ngstarter-ui/components/toolbar';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { ResizableContainer } from '@ngstarter-ui/components/resizable-container';

@Component({
  selector: 'toolbar-overflow-example',
  templateUrl: './toolbar-overflow-example.html',
  standalone: true,
  imports: [Toolbar, ToolbarTitle, ToolbarSpacer, ToolbarItem, Button, Icon, ResizableContainer],
})
export class ToolbarOverflowExample {}
