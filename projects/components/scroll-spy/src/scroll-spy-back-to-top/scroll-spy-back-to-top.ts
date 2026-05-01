import { Component, DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { PANEL_CONTENT } from '@ngstarter/components/panel';
import { LAYOUT_CONTENT } from '@ngstarter/components/layout';
import { isPlatformServer } from '@angular/common';
import { Icon } from '@ngstarter/components/icon';

@Component({
  selector: 'ngs-scroll-spy-back-to-top,[ngs-scroll-spy-back-to-top]',
  exportAs: 'ngsScrollSpyBackToTop',
  imports: [
    Icon
  ],
  templateUrl: './scroll-spy-back-to-top.html',
  styleUrl: './scroll-spy-back-to-top.scss',
  host: {
    '(click)': 'scrollToTop()'
  }
})
export class ScrollSpyBackToTop {
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private panelBody = inject(PANEL_CONTENT, { optional: true });
  private layoutBody = inject(LAYOUT_CONTENT, { optional: true });

  private scrollContainer: HTMLElement;

  scrollToTop() {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    if (this.panelBody) {
      this.scrollContainer = this.panelBody.scrollContainer();
    } else if (this.layoutBody) {
      this.scrollContainer = this.layoutBody.scrollContainer();
    } else {
      this.scrollContainer = this.document.body;
    }

    if (this.scrollContainer) {
      this.scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
}
