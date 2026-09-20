import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Page } from '../page/page';
import { PageContentDirective } from '../page/page-content.directive';
import { PageTitleDirective } from '../page/page-title.directive';

@Component({
  selector: 'app-category-overview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [Page, PageContentDirective, PageTitleDirective],
  template: `
    <app-page>
      <h1 appPageTitle>{{ title }}</h1>
      <div appPageContent>
        <p>{{ intro }}</p>
      </div>
    </app-page>
  `,
})
export class CategoryOverview {
  private readonly route = inject(ActivatedRoute);
  readonly title = this.route.snapshot.title || '';
  readonly intro = this.route.snapshot.data['seoIntro'] || '';
}
