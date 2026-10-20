import { Component, DOCUMENT, inject, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { LAYOUT_CONTENT } from '@ngstarter-ui/components/layout';
import { isPlatformServer } from '@angular/common';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'ngs-scroll-spy-back-to-top,[ngs-scroll-spy-back-to-top]',
  exportAs: 'ngsScrollSpyBackToTop',
  imports: [
    Icon
  ],
  templateUrl: './scroll-spy-back-to-top.html',
  styleUrl: './scroll-spy-back-to-top.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    '(click)': 'scrollToTop()'
  }
})
export class ScrollSpyBackToTop {
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private layoutBody = inject(LAYOUT_CONTENT, { optional: true });

  private scrollContainer: HTMLElement;

  scrollToTop() {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    if (this.layoutBody) {
      this.scrollContainer = this.layoutBody.scrollContainer();
    } else {
      this.scrollContainer = (this.document.scrollingElement as HTMLElement | null) ??
        this.document.documentElement ??
        this.document.body
      ;
    }

    if (this.scrollContainer) {
      this.scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
}
