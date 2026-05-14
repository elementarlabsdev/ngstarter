import { Routes } from '@angular/router';
import { HOME_SEO, LICENSE_SEO, PRICING_SEO, PRIVACY_SEO, TERMS_SEO } from './seo/seo-data';

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
