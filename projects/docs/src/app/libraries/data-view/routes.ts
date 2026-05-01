import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./overview/overview').then(c => c.Overview),
  },
  {
    path: 'basic-dataview',
    loadComponent: () => import('./basic-dataview/basic-dataview').then(c => c.BasicDataview),
  },
  {
    path: 'column-pinning',
    loadComponent: () => import('./column-pinning/column-pinning').then(c => c.DataViewColumnPinning),
  },
  {
    path: 'column-settings',
    loadComponent: () => import('./column-settings/column-settings').then(c => c.DataViewColumnSettings),
  },
  {
    path: 'custom-cell-renderers',
    loadComponent: () => import('./custom-cell-renderers/custom-cell-renderers').then(c => c.DataViewCustomCellRenderers),
  },
  {
    path: 'custom-empty-state',
    loadComponent: () => import('./custom-empty-state/custom-empty-state').then(c => c.DataViewCustomEmptyState),
  },
  {
    path: 'embedded',
    loadComponent: () => import('./embedded/embedded').then(c => c.DataViewEmbedded),
  },
  {
    path: 'filter-data',
    loadComponent: () => import('./filter-data/filter-data').then(c => c.DataViewFilterData),
  },
  {
    path: 'loading-state',
    loadComponent: () => import('./loading-state/loading-state').then(c => c.DataViewLoadingState),
  },
  {
    path: 'pinning-pagination',
    loadComponent: () => import('./pinning-pagination/pinning-pagination').then(c => c.DataViewPinningPagination),
  },
  {
    path: 'refresh',
    loadComponent: () => import('./refresh/refresh').then(c => c.DataViewRefresh),
  },
  {
    path: 'resizable-columns',
    loadComponent: () => import('./resizable-columns/resizable-columns').then(c => c.DataViewResizableColumns),
  },
  {
    path: 'server-side-empty-state',
    loadComponent: () => import('./server-side-empty-state/server-side-empty-state').then(c => c.DataViewServerSideEmptyState),
  },
  {
    path: 'server-side',
    loadComponent: () => import('./server-side/server-side').then(c => c.DataViewServerSide),
  },
  {
    path: 'sticky-columns',
    loadComponent: () => import('./sticky-columns/sticky-columns').then(c => c.DataViewStickyColumns),
  },
  {
    path: 'with-action-bar',
    loadComponent: () => import('./with-action-bar/with-action-bar').then(c => c.DataViewWithActionBar),
  },
  {
    path: 'with-pagination',
    loadComponent: () => import('./with-pagination/with-pagination').then(c => c.DataViewWithPagination),
  },
  {
    path: 'with-sorting',
    loadComponent: () => import('./with-sorting/with-sorting').then(c => c.DataViewWithSorting),
  },
  {
    path: 'with-selection',
    loadComponent: () => import('./with-selection/with-selection').then(c => c.DataviewWithSelection),
  },
];
