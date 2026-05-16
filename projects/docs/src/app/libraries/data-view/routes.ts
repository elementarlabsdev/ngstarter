import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'basic-dataview',
    loadComponent: () => import('./basic-dataview/basic-dataview').then(c => c.BasicDataview),
    title: 'Data View / Basic Dataview'
  },
  {
    path: 'column-pinning',
    loadComponent: () => import('./column-pinning/column-pinning').then(c => c.DataViewColumnPinning),
    title: 'Data View / Column Pinning'
  },
  {
    path: 'column-settings',
    loadComponent: () => import('./column-settings/column-settings').then(c => c.DataViewColumnSettings),
    title: 'Data View / Column Settings'
  },
  {
    path: 'custom-cell-renderers',
    loadComponent: () => import('./custom-cell-renderers/custom-cell-renderers').then(c => c.DataViewCustomCellRenderers),
    title: 'Data View / Custom Cell Renderers'
  },
  {
    path: 'custom-empty-state',
    loadComponent: () => import('./custom-empty-state/custom-empty-state').then(c => c.DataViewCustomEmptyState),
    title: 'Data View / Custom Empty State'
  },
  {
    path: 'embedded',
    loadComponent: () => import('./embedded/embedded').then(c => c.DataViewEmbedded),
    title: 'Data View / Embedded'
  },
  {
    path: 'filter-data',
    loadComponent: () => import('./filter-data/filter-data').then(c => c.DataViewFilterData),
    title: 'Data View / Filter Data'
  },
  {
    path: 'loading-state',
    loadComponent: () => import('./loading-state/loading-state').then(c => c.DataViewLoadingState),
    title: 'Data View / Loading State'
  },
  {
    path: 'pinning-pagination',
    loadComponent: () => import('./pinning-pagination/pinning-pagination').then(c => c.DataViewPinningPagination),
    title: 'Data View / Pinning Pagination'
  },
  {
    path: 'refresh',
    loadComponent: () => import('./refresh/refresh').then(c => c.DataViewRefresh),
    title: 'Data View / Refresh'
  },
  {
    path: 'resizable-columns',
    loadComponent: () => import('./resizable-columns/resizable-columns').then(c => c.DataViewResizableColumns),
    title: 'Data View / Resizable Columns'
  },
  {
    path: 'server-side-empty-state',
    loadComponent: () => import('./server-side-empty-state/server-side-empty-state').then(c => c.DataViewServerSideEmptyState),
    title: 'Data View / Server Side Empty State'
  },
  {
    path: 'server-side',
    loadComponent: () => import('./server-side/server-side').then(c => c.DataViewServerSide),
    title: 'Data View / Server Side'
  },
  {
    path: 'sticky-columns',
    loadComponent: () => import('./sticky-columns/sticky-columns').then(c => c.DataViewStickyColumns),
    title: 'Data View / Sticky Columns'
  },
  {
    path: 'with-action-bar',
    loadComponent: () => import('./with-action-bar/with-action-bar').then(c => c.DataViewWithActionBar),
    title: 'Data View / With Action Bar'
  },
  {
    path: 'with-pagination',
    loadComponent: () => import('./with-pagination/with-pagination').then(c => c.DataViewWithPagination),
    title: 'Data View / With Pagination'
  },
  {
    path: 'with-sorting',
    loadComponent: () => import('./with-sorting/with-sorting').then(c => c.DataViewWithSorting),
    title: 'Data View / With Sorting'
  },
  {
    path: 'with-selection',
    loadComponent: () => import('./with-selection/with-selection').then(c => c.DataviewWithSelection),
    title: 'Data View / With Selection'
  },
  {
    path: '',
    loadComponent: () => import('./common/common').then(c => c.Common),
    title: 'Data View',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./overview/overview').then(c => c.Overview),
        title: 'Data View / Overview'
      },
      {
        path: 'api',
        loadComponent: () => import('./api/api').then(c => c.Api),
        title: 'Data View / Api'
      },
    ]
  },
];
