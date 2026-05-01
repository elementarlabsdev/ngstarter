import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'overview',
    pathMatch: 'full',
    loadComponent: () => import('./overview/overview').then(c => c.Overview),
    title: 'Video Player'
  },
  {
    path: 'basic-example',
    loadComponent: () => import('./basic-example/basic-example').then(c => c.BasicExample),
    title: 'Video Player'
  },
  {
    path: 'minimal-example',
    loadComponent: () => import('./minimal-example/minimal-example').then(c => c.MinimalExample),
    title: 'Video Player Minimal'
  },
  {
    path: 'carousel-example',
    loadComponent: () => import('./carousel-example/carousel-example').then(c => c.CarouselExample),
    title: 'Video Player Carousel'
  },
];
