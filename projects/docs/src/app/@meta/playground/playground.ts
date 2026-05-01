import { Component, inject, input, ViewEncapsulation, viewChild, booleanAttribute } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { MarkdownComponent, provideMarkdown } from 'ngx-markdown';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'ngs-playground',
  imports: [
    Icon,
    MarkdownComponent,
    Button
  ],
  providers: [
    provideMarkdown()
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './playground.html',
  styleUrl: 'playground.scss'
})
export class Playground {
  private _snackBar = inject(SnackBar);

  exampleUrl = input<string>();
  exampleName = input<string>();
  compact = input(false, {
    transform: booleanAttribute
  });

  htmlSrc: string;
  tsSrc: string;
  cssSrc: string;
  alreadyLoaded = false;

  readonly _markdownRef = viewChild<any>('markdownRef');

  showSource = false;
  currentTab = 'html';
  exampleLoading = false;

  get hasScr(): boolean {
    return !!this.htmlSrc || !!this.tsSrc || !!this.cssSrc;
  }

  get src(): string | null {
    if (this.isCurrentTab('html')) {
      return "```html\n" +
        "" + this.htmlSrc + "```";
    }

    if (this.isCurrentTab('ts')) {
      return "```typescript\n" +
        "" + this.tsSrc + "```";
    }

    if (this.isCurrentTab('css')) {
      return "```css\n" +
        "" + this.cssSrc + "```";
    }

    return null;
  }

  contentCopy(): void {
    const text = this._markdownRef().element.nativeElement.querySelector('pre code').innerText;
    navigator.clipboard.writeText(text);
    this._snackBar.open('Source code has been copied to your clipboard', '', {
      duration: 3000
    });
  }

  async toggleSource() {
    this.showSource = !this.showSource;

    if (this.showSource) {
      if (this.alreadyLoaded) {
        return;
      }

      const urls = this.compact() ? [
          fetch(`${this.exampleUrl()}/${this.exampleName()}/${this.exampleName()}.ts`),
          fetch(`${this.exampleUrl()}/${this.exampleName()}/${this.exampleName()}.scss`),
          fetch(`${this.exampleUrl()}/${this.exampleName()}/${this.exampleName()}.html`),
        ] : [
        fetch(`${this.exampleUrl()}/${this.exampleName()}/${this.exampleName()}.ts`),
        fetch(`${this.exampleUrl()}/${this.exampleName()}/${this.exampleName()}.scss`),
        fetch(`${this.exampleUrl()}/${this.exampleName()}/${this.exampleName()}.html`),
      ]

      this.exampleLoading = true;
      const r = await Promise.all(urls)
      .then(r => r.map(f => f.text()));
        this.tsSrc = await r[0];
        this.cssSrc = await r[1];
        this.htmlSrc = await r[2];
        this.exampleLoading = false;
        this.alreadyLoaded = true;
      } else {
        this.exampleLoading = false;
      }
  }

  isCurrentTab(tabId: string): boolean {
    return this.currentTab === tabId;
  }

  selectTab(tabId: string): void {
    this.currentTab = tabId;
  }
}
