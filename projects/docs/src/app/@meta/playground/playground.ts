import { booleanAttribute, ChangeDetectionStrategy, Component, DestroyRef, effect, ElementRef, inject, input, signal, ViewEncapsulation, viewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Icon } from '@ngstarter-ui/components/icon';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { Button } from '@ngstarter-ui/components/button';
import { Drawer } from '@ngstarter-ui/components/drawer';
import { Navigation, NavigationItem, NavigationItemIconDirective } from '@ngstarter-ui/components/navigation';
import { Layout, LayoutContent, LayoutHeader, LayoutSidebar } from '@ngstarter-ui/components/layout';
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
    Layout,
    LayoutContent,
    LayoutHeader,
    LayoutSidebar,
    ScrollbarArea,
  ],
  encapsulation: ViewEncapsulation.None,
  host: {
    '(document:fullscreenchange)': 'onFullscreenChange()',
    '(document:keydown.escape)': 'onFullscreenEscape($event)',
  },
  templateUrl: './playground.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: 'playground.scss'
})
export class Playground {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly previewFrame = viewChild<ElementRef<HTMLDivElement>>('previewFrame');
  private readonly sourceDrawer = viewChild<Drawer>('sourceDrawer');
  private enteringFullscreen = false;
  protected readonly fullscreenMode = signal<'native' | 'viewport' | null>(null);
  protected readonly inlineHeight = signal(0);

  exampleUrl = input<string>();
  exampleName = input<string>();
  readonly fullscreen = input(false, { transform: booleanAttribute });
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

  constructor() {
    effect(() => {
      if (!this.fullscreen() && this.fullscreenMode()) void this.exitFullscreen();
    });
  }

  protected async toggleFullscreen(): Promise<void> {
    if (this.fullscreenMode()) {
      await this.exitFullscreen();
      return;
    }

    const frame = this.previewFrame()?.nativeElement;
    if (!frame || !this.fullscreen() || this.enteringFullscreen) return;
    this.inlineHeight.set(frame.offsetHeight);
    this.enteringFullscreen = true;
    try {
      if (this.document.fullscreenEnabled && frame.requestFullscreen) {
        await frame.requestFullscreen();
        return;
      }
    } catch {
      // Embedded docs may be denied native fullscreen. Expand within their viewport instead.
    } finally {
      this.enteringFullscreen = false;
    }
    if (this.fullscreen() && !this.destroyRef.destroyed) this.fullscreenMode.set('viewport');
  }

  protected onFullscreenChange(): void {
    const frame = this.previewFrame()?.nativeElement;
    if (frame && this.document.fullscreenElement === frame) {
      this.fullscreenMode.set('native');
    } else if (this.fullscreenMode() === 'native') {
      this.fullscreenMode.set(null);
    }
  }

  protected onFullscreenEscape(event: Event): void {
    if (this.fullscreenMode() === 'viewport' && !event.defaultPrevented && !this.showSource) {
      this.fullscreenMode.set(null);
    }
  }

  private async exitFullscreen(): Promise<void> {
    if (this.fullscreenMode() === 'viewport') {
      this.fullscreenMode.set(null);
    } else if (this.document.fullscreenElement === this.previewFrame()?.nativeElement) {
      await this.document.exitFullscreen().catch(() => this.onFullscreenChange());
    }
  }

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
