import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./overview/overview').then(c => c.Overview),
    title: 'Headless Editor'
  },
  {
    path: 'getting-started',
    loadComponent: () => import('./getting-started/getting-started').then(c => c.GettingStarted),
    title: 'Headless Editor / Getting Started'
  },
  {
    path: 'document-model',
    loadComponent: () => import('./document-model/document-model').then(c => c.DocumentModel),
    title: 'Headless Editor / Document Model'
  },
  {
    path: 'surface',
    loadComponent: () => import('./surface/surface').then(c => c.Surface),
    title: 'Headless Editor / Surface and Input'
  },
  {
    path: 'commands',
    loadComponent: () => import('./commands/commands').then(c => c.Commands),
    title: 'Headless Editor / Commands and Toolbar'
  },
  {
    path: 'marks',
    loadComponent: () => import('./marks/marks').then(c => c.Marks),
    title: 'Headless Editor / Marks and Formatting'
  },
  {
    path: 'blocks',
    loadComponent: () => import('./blocks/blocks').then(c => c.Blocks),
    title: 'Headless Editor / Blocks'
  },
  {
    path: 'component-blocks',
    loadComponent: () => import('./component-blocks/component-blocks').then(c => c.ComponentBlocks),
    title: 'Headless Editor / Component Blocks'
  },
  {
    path: 'tables',
    loadComponent: () => import('./tables/tables').then(c => c.Tables),
    title: 'Headless Editor / Tables'
  },
  {
    path: 'plugins',
    loadComponent: () => import('./plugins/plugins').then(c => c.Plugins),
    title: 'Headless Editor / Plugins'
  },
  {
    path: 'mentions',
    loadComponent: () => import('./mentions/mentions').then(c => c.Mentions),
    title: 'Headless Editor / Mentions'
  },
  {
    path: 'selection-history',
    loadComponent: () => import('./selection-history/selection-history').then(c => c.SelectionHistory),
    title: 'Headless Editor / Selection and History'
  },
  {
    path: 'serialization',
    loadComponent: () => import('./serialization/serialization').then(c => c.Serialization),
    title: 'Headless Editor / Forms and Serialization'
  },
  {
    path: 'api',
    loadComponent: () => import('./api/api').then(c => c.Api),
    title: 'Headless Editor / Api'
  }
];
