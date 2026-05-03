import { Component, input, ViewEncapsulation, booleanAttribute } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { Button } from '@ngstarter-ui/components/button';
import {Expand} from "@ngstarter-ui/components/expand";

@Component({
  selector: 'ngs-playground',
  imports: [
    Icon,
    CodeHighlighter,
    Button,
    Expand
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './playground.html',
  styleUrl: 'playground.scss'
})
export class Playground {

  exampleUrl = input<string>();
  exampleName = input<string>();
  compact = input(false, {
    transform: booleanAttribute
  });

  htmlSrc: string;
  tsSrc: string;
  cssSrc: string;
  alreadyLoaded = false;

  showSource = false;
  currentTab = 'html';
  exampleLoading = false;

  get hasScr(): boolean {
    return !!this.htmlSrc || !!this.tsSrc || !!this.cssSrc;
  }

  get code(): string | null {
    if (this.isCurrentTab('html')) {
      return this.htmlSrc;
    }

    if (this.isCurrentTab('ts')) {
      return this.tsSrc;
    }

    if (this.isCurrentTab('css')) {
      return this.cssSrc;
    }

    return null;
  }

  get language(): string {
    if (this.isCurrentTab('html')) {
      return 'html';
    }

    if (this.isCurrentTab('ts')) {
      return 'typescript';
    }

    if (this.isCurrentTab('css')) {
      return 'css';
    }

    return 'none';
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
