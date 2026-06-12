import { Routes } from '@angular/router';
import {
  BASIC_LAYOUT_ARTICLE_SEO,
  BLOG_SEO,
  HOME_SEO,
  LICENSE_SEO,
  PANEL_LAYOUT_ARTICLE_SEO,
  PRICING_SEO,
  PRIVACY_SEO,
  TEMPLATES_SEO,
  TERMS_SEO,
} from './seo/seo-data';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: HOME_SEO.title,
    data: {
      seo: HOME_SEO,
    },
    loadComponent: () => import('./pages/home/home').then(c => c.Home),
  },
  {
    path: 'pricing',
    title: PRICING_SEO.title,
    data: {
      seo: PRICING_SEO,
    },
    loadComponent: () => import('./pages/pricing/pricing').then(c => c.Pricing),
  },
  {
    path: 'templates',
    title: TEMPLATES_SEO.title,
    data: {
      seo: TEMPLATES_SEO,
    },
    loadComponent: () => import('./pages/templates/templates').then(c => c.Templates),
  },
  {
    path: 'blog',
    title: BLOG_SEO.title,
    data: {
      seo: BLOG_SEO,
    },
    loadComponent: () => import('./blog/blog/blog').then(c => c.Blog),
  },
  {
    path: 'blog/basic-application-layout',
    title: BASIC_LAYOUT_ARTICLE_SEO.title,
    data: {
      seo: BASIC_LAYOUT_ARTICLE_SEO,
    },
    loadComponent: () =>
      import('./blog/articles/basic-application-layout/basic-application-layout').then(
        c => c.BasicApplicationLayout,
      ),
  },
  {
    path: 'blog/angular-panel-layout',
    title: PANEL_LAYOUT_ARTICLE_SEO.title,
    data: {
      seo: PANEL_LAYOUT_ARTICLE_SEO,
    },
    loadComponent: () =>
      import('./blog/articles/angular-panel-layout/angular-panel-layout').then(
        c => c.AngularPanelLayout,
      ),
  },
  {
    path: 'license',
    title: LICENSE_SEO.title,
    data: {
      seo: LICENSE_SEO,
    },
    loadComponent: () => import('./pages/license/license').then(c => c.License),
  },
  {
    path: 'privacy',
    title: PRIVACY_SEO.title,
    data: {
      seo: PRIVACY_SEO,
    },
    loadComponent: () => import('./pages/privacy/privacy').then(c => c.Privacy),
  },
  {
    path: 'terms',
    title: TERMS_SEO.title,
    data: {
      seo: TERMS_SEO,
    },
    loadComponent: () => import('./pages/terms/terms').then(c => c.Terms),
  },
  // {
  //   path: '**',
  //   title: 'Page Not Found',
  //   loadComponent: () => import('./error/not-found/not-found').then(c => c.NotFound)
  // }
];
