import { Component } from '@angular/core';
import { Toolbar, ToolbarTitle, ToolbarSpacer } from '@ngstarter-ui/components/toolbar';

@Component({
  selector: 'basic-toolbar-example',
  templateUrl: './basic-toolbar-example.html',
  styleUrl: './basic-toolbar-example.scss',
  standalone: true,
  imports: [Toolbar, ToolbarTitle, ToolbarSpacer],
})
export class BasicToolbarExample {}
