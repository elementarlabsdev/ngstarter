import { Component, input, ViewEncapsulation, booleanAttribute, viewChild } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { Button } from '@ngstarter-ui/components/button';
import { Drawer } from '@ngstarter-ui/components/drawer';
import { Navigation, NavigationItem, NavigationItemIconDirective } from '@ngstarter-ui/components/navigation';
import { Panel, PanelContent, PanelHeader, PanelSidebar } from '@ngstarter-ui/components/panel';
import { ScrollbarArea, ScrollContainerFixed } from '@ngstarter-ui/components/scrollbar-area';

type PlaygroundSourceTab = 'html' | 'ts' | 'scss';

type PlaygroundSourceFile = {
  tab: PlaygroundSourceTab;
  extension: string;
  language: string;
  icon: string;
};

@Component({
  selector: 'ngs-playground',
  imports: [
    Icon,
    CodeHighlighter,
    Button,
    Drawer,
    Navigation,
    NavigationItem,
    NavigationItemIconDirective,
    Panel,
    PanelContent,
    PanelHeader,
    PanelSidebar,
    ScrollbarArea,
    ScrollContainerFixed
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './playground.html',
  styleUrl: 'playground.scss'
})
export class Playground {
  private readonly sourceDrawer = viewChild<Drawer>('sourceDrawer');

  exampleUrl = input<string>();
  exampleName = input<string>();
  compact = input(false, {
    transform: booleanAttribute
  });

  readonly sourceFiles: PlaygroundSourceFile[] = [
    {
      tab: 'html',
      extension: 'html',
      language: 'html',
      icon: 'fluent:code-24-regular'
    },
    {
      tab: 'ts',
      extension: 'ts',
      language: 'typescript',
      icon: 'fluent:braces-24-regular'
    },
    {
      tab: 'scss',
      extension: 'scss',
      language: 'scss',
      icon: 'fluent:paint-brush-24-regular'
    }
  ];

  htmlSrc: string;
  tsSrc: string;
  cssSrc: string;
  alreadyLoaded = false;

  showSource = false;
  currentTab: PlaygroundSourceTab = 'html';
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

    if (this.isCurrentTab('scss')) {
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

    return this.currentSourceFile?.language || 'none';
  }

  async toggleSource() {
    if (this.showSource) {
      this.sourceDrawer()?.close();
      return;
    }

    this.showSource = true;
    this.sourceDrawer()?.open();

    if (this.alreadyLoaded) {
      return;
    }

    this.exampleLoading = true;

    const [tsSrc, cssSrc, htmlSrc] = await Promise.all([
      this.fetchExampleFile('ts'),
      this.fetchExampleFile('scss'),
      this.fetchExampleFile('html'),
    ]);

    this.tsSrc = tsSrc;
    this.cssSrc = cssSrc;
    this.htmlSrc = htmlSrc;
    this.exampleLoading = false;
    this.alreadyLoaded = true;
  }

  isCurrentTab(tabId: PlaygroundSourceTab): boolean {
    return this.currentTab === tabId;
  }

  selectTab(tabId: PlaygroundSourceTab): void {
    this.currentTab = tabId;
  }

  selectSourceTab(tabId: unknown): void {
    this.selectTab(tabId as PlaygroundSourceTab);
  }

  get currentSourceFile(): PlaygroundSourceFile | undefined {
    return this.sourceFiles.find(file => file.tab === this.currentTab);
  }

  get currentFileName(): string {
    const file = this.currentSourceFile;
    return file ? `${this.exampleName()}.${file.extension}` : '';
  }

  fileNameFor(file: PlaygroundSourceFile): string {
    return `${this.exampleName()}.${file.extension}`;
  }

  onDrawerClosed(): void {
    this.showSource = false;
  }

  private async fetchExampleFile(extension: PlaygroundSourceFile['extension']): Promise<string> {
    const response = await fetch(`${this.exampleUrl()}/${this.exampleName()}/${this.exampleName()}.${extension}`);

    if (!response.ok) {
      return '';
    }

    const source = await response.text();

    if (this.isDocsFallbackResponse(source)) {
      return '';
    }

    return source;
  }

  private isDocsFallbackResponse(source: string): boolean {
    const normalizedSource = source.trimStart().toLowerCase();

    return normalizedSource.startsWith('<!doctype html') || normalizedSource.startsWith('<html');
  }
}
