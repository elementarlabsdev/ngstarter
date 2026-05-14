import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-category-overview',
  standalone: true,
  template: `
    <section class="space-y-6">
      <p class="docs-seo-intro mb-6 text-base leading-7 text-neutral-600">
        {{ intro }}
      </p>
    </section>
  `,
})
export class CategoryOverview {
  private readonly route = inject(ActivatedRoute);
  readonly intro = this.route.snapshot.data['seoIntro'] || '';
}
