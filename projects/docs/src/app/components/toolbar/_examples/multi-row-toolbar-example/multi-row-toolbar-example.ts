import { Component } from '@angular/core';
import { Toolbar, ToolbarRow, ToolbarTitle, ToolbarSpacer, ToolbarItem } from '@ngstarter/components/toolbar';

@Component({
  selector: 'multi-row-toolbar-example',
  templateUrl: './multi-row-toolbar-example.html',
  styleUrl: './multi-row-toolbar-example.scss',
  standalone: true,
  imports: [Toolbar, ToolbarRow, ToolbarTitle, ToolbarSpacer, ToolbarItem],
})
export class MultiRowToolbarExample {}
