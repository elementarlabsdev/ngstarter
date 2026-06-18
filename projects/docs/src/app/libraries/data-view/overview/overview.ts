import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Card, CardContent, CardHeader, CardTitle } from '@ngstarter-ui/components/card';

@Component({
  selector: 'app-overview',
  imports: [
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    RouterLink,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {
  readonly items = [
    {
      routerLink: 'basic-dataview',
      title: 'Basic data view',
      description: 'Simple tabular data presentation with essential features.'
    },
    {
      routerLink: 'with-selection',
      title: 'Data view with selection',
      description: 'Allow users to select rows for further actions.'
    },
    {
      routerLink: 'row-click-selection',
      title: 'Data view row click selection',
      description: 'Select one active row by clicking the row body.'
    },
    {
      routerLink: 'with-pagination',
      title: 'Data view with pagination',
      description: 'Navigate through large datasets with ease.'
    },
    {
      routerLink: 'embedded',
      title: 'Embedded data view',
      description: 'Data view integrated into other components or containers.'
    },
    {
      routerLink: 'with-sorting',
      title: 'Data view with sorting',
      description: 'Quickly sort columns to organize data.'
    },
    {
      routerLink: 'resizable-columns',
      title: 'Data view with resizable columns',
      description: 'Adjust column widths to suit user preferences.'
    },
    {
      routerLink: 'column-settings',
      title: 'Data view with column settings',
      description: 'Manage column visibility and ordering.'
    },
    {
      routerLink: 'column-pinning',
      title: 'Data view with column pinning',
      description: 'Pin important columns for easy reference.'
    },
    {
      routerLink: 'pinning-pagination',
      title: 'Data view with column pinning and pagination',
      description: 'Combine pinning and pagination for better usability.'
    },
    {
      routerLink: 'custom-cell-renderers',
      title: 'Data view with custom cell renderers',
      description: 'Customize how data is displayed within cells.'
    },
    {
      routerLink: 'with-action-bar',
      title: 'Data view with action bar',
      description: 'Add a dedicated action bar for common operations.'
    },
    {
      routerLink: 'filter-data',
      title: 'Data view filter data',
      description: 'Apply flexible filters to find specific data.'
    },
    {
      routerLink: 'loading-state',
      title: 'Data view loading state',
      description: 'Indicate when data is being loaded or refreshed.'
    },
    {
      routerLink: 'sticky-columns',
      title: 'Data view with sticky columns',
      description: 'Keep certain columns visible while scrolling horizontally.'
    },
    {
      routerLink: 'server-side',
      title: 'Data view with server side data loading',
      description: 'Efficiently handle large datasets with server-side operations.'
    },
    {
      routerLink: 'server-side-empty-state',
      title: 'Data view with server side data loading (empty state)',
      description: 'Handle cases where no data is available from the server.'
    },
    {
      routerLink: 'custom-empty-state',
      title: 'Data view with custom empty state',
      description: 'Provide meaningful feedback when no data is displayed.'
    },
    {
      routerLink: 'refresh',
      title: 'Data view refresh (client and server side)',
      description: 'Easily refresh data to keep it up to date.'
    },
  ];
}
