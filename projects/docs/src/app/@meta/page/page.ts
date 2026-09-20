import { booleanAttribute, Component, input, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DocsNavigationService, DocsRelatedLink } from '../../navigation/docs-navigation.service';

@Component({
  selector: 'app-page',
  imports: [RouterLink],
  templateUrl: './page.html',
  styleUrl: './page.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class Page {
  readonly wide = input(false, { transform: booleanAttribute });

  constructor(
    private readonly router: Router,
    private readonly docsNavigation: DocsNavigationService
  ) {}

  protected get relatedLinks(): readonly DocsRelatedLink[] {
    return this.docsNavigation.relatedLinksForUrl(this.router.url);
  }

}
