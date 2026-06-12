import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Card, CardContent } from '@ngstarter-ui/components/card';
import { Chip, ChipSet } from '@ngstarter-ui/components/chips';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-blog',
  imports: [Card, CardContent, Chip, ChipSet, Icon, RouterLink],
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
})
export class Blog {
  readonly articles = [
    {
      title: 'Angular Panel Layout: Create Admin Workspaces with ngs-panel',
      description:
        'Learn angular panel layout patterns for admin screens: single workspaces, master-detail pages, side inspectors, and footer actions with ngs-panel.',
      href: '/blog/angular-panel-layout',
      date: 'June 12, 2026',
      readTime: '9 min',
      category: 'Angular Panel Layout',
      icon: 'fluent:panel-right-24-regular',
    },
    {
      title: 'Angular Admin Layout: Build a Basic Shell with NgStarter UI',
      description:
        'Build an angular admin shell step by step with a root layout, sidenav, sidebar, panel header, scrollable content, and workspace.',
      href: '/blog/basic-application-layout',
      date: 'June 12, 2026',
      readTime: '8 min',
      category: 'Angular Admin',
      icon: 'fluent:layout-column-two-24-regular',
    },
  ];
}
