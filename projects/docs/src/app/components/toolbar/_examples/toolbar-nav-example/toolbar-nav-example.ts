import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Toolbar, ToolbarTitle, ToolbarSpacer, ToolbarNav, ToolbarNavLink } from '@ngstarter-ui/components/toolbar';

@Component({
  selector: 'toolbar-nav-example',
  templateUrl: './toolbar-nav-example.html',
  styleUrl: './toolbar-nav-example.scss',
  standalone: true,
  imports: [Toolbar, ToolbarTitle, ToolbarSpacer, ToolbarNav, ToolbarNavLink, RouterLink],
})
export class ToolbarNavExample {}
