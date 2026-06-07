import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'overview',
    loadComponent: () => import('./overview/overview').then(c => c.Overview),
    title: 'Content Editor'
  },
  {
    path: 'content-builder',
    loadComponent: () => import('./content-builder/content-builder').then(c => c.ContentBuilder),
    title: 'Content Editor Builder'
  },
  {
    path: 'content-editor-renderer-api',
    loadComponent: () => import('./content-editor-renderer-api/content-editor-renderer-api').then(c => c.ContentEditorRendererApi),
    title: 'Content Editor Renderer / Api'
  },
];
