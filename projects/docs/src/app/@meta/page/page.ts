import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DocsNavigationService, DocsRelatedLink } from '../../navigation/docs-navigation.service';

@Component({
  selector: 'app-page',
  imports: [RouterLink],
  templateUrl: './page.html',
  styleUrl: './page.scss',
  standalone: true
})
export class Page {
  private readonly productionDocsSections = new Set([
    'components',
    'forms',
    'libraries',
    'micro-charts',
    'navigation',
  ]);

  constructor(
    private readonly router: Router,
    private readonly docsNavigation: DocsNavigationService
  ) {}

  protected get showProductionLinks(): boolean {
    const [section, slug] = this.pathSegments;

    return Boolean(slug && this.productionDocsSections.has(section));
  }

  protected get relatedLinks(): readonly DocsRelatedLink[] {
    return this.docsNavigation.relatedLinksForUrl(this.router.url);
  }

  private get pathSegments(): string[] {
    return this.router.url
      .split(/[?#]/)[0]
      .replace(/^\/+|\/+$/g, '')
      .split('/')
      .filter(Boolean);
  }

}
