import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Card, CardContent, CardFooter } from '@ngstarter/components/card';
import { OrderByPipe } from '@ngstarter/components/core';

@Component({
  imports: [
    RouterLink,
    Card,
    CardContent,
    CardFooter,
    OrderByPipe
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {
  items = signal([
    {
      routerLink: '/components/divider',
      imageUrl: 'assets/overview/divider.svg',
      name: 'Divider'
    },
    {
      routerLink: '/components/command-bar',
      imageUrl: 'assets/overview/command-bar.svg',
      name: 'Command Bar'
    },
    {
      routerLink: '/components/table',
      imageUrl: 'assets/overview/table.svg',
      name: 'Table'
    },
    {
      routerLink: '/libraries/data-view',
      imageUrl: 'assets/overview/data-view.svg',
      name: 'Data View'
    },
    {
      routerLink: '/components/announcement',
      imageUrl: 'assets/overview/announcement.svg',
      name: 'AnnouncementData'
    },
    {
      routerLink: '/components/expansion-panel',
      imageUrl: 'assets/overview/accordion.svg',
      name: 'Expansion Panel'
    },
    {
      routerLink: '/components/dialog',
      imageUrl: 'assets/overview/dialog.svg',
      name: 'Dialog'
    },
    {
      routerLink: '/forms/radio',
      imageUrl: 'assets/overview/radio.svg',
      name: 'Radio'
    },
    {
      routerLink: '/components/list',
      imageUrl: 'assets/overview/list.svg',
      name: 'List'
    },
    {
      routerLink: '/components/datepicker',
      imageUrl: 'assets/overview/datepicker.svg',
      name: 'Date Picker'
    },
    {
      routerLink: '/components/number-input',
      imageUrl: 'assets/overview/number-input.svg',
      name: 'Number Input'
    },
    {
      routerLink: '/components/skeleton',
      imageUrl: 'assets/overview/skeleton.svg',
      name: 'Skeleton'
    },
    {
      routerLink: '/components/upload',
      imageUrl: 'assets/overview/upload.svg',
      name: 'Upload'
    },
    {
      routerLink: '/components/filter-builder',
      imageUrl: 'assets/overview/filter-builder.svg',
      name: 'Filter Builder'
    },
    {
      routerLink: '/forms/input',
      imageUrl: 'assets/overview/input.svg',
      name: 'Input'
    },
    {
      routerLink: '/components/badge',
      imageUrl: 'assets/overview/badge.svg',
      name: 'Badge'
    },
    {
      routerLink: '/components/snackbar',
      imageUrl: 'assets/overview/snackbar.svg',
      name: 'Snackbar'
    },
    {
      routerLink: '/components/progress-spinner',
      imageUrl: 'assets/overview/spinner.svg',
      name: 'Progress ProgressSpinner'
    },
    {
      routerLink: '/components/stepper',
      imageUrl: 'assets/overview/stepper.svg',
      name: 'Stepper'
    },
    {
      routerLink: '/forms/slide-toggle',
      imageUrl: 'assets/overview/slide-toggle.svg',
      name: 'Slide Toggle'
    },
    {
      routerLink: '/forms/pin-input',
      imageUrl: 'assets/overview/pin-input.svg',
      name: 'Pin Input'
    },
    {
      routerLink: '/forms/button-toggle',
      imageUrl: 'assets/overview/button-toggle.svg',
      name: 'Button Toggle'
    },
    {
      routerLink: '/components/popover',
      imageUrl: 'assets/overview/popover.svg',
      name: 'Popover'
    },
    {
      routerLink: '/components/tooltip',
      imageUrl: 'assets/overview/tooltip.svg',
      name: 'Tooltip'
    },
    {
      routerLink: '/components/menu',
      imageUrl: 'assets/overview/menu.svg',
      name: 'Menu'
    },
    {
      routerLink: '/components/slider',
      imageUrl: 'assets/overview/slider.svg',
      name: 'Slider'
    },
    {
      routerLink: '/components/layout',
      imageUrl: 'assets/overview/layout.svg',
      name: 'Layout'
    },
    {
      routerLink: '/components/icon',
      imageUrl: 'assets/overview/icons.svg',
      name: 'Icon'
    },
  ]);
}
