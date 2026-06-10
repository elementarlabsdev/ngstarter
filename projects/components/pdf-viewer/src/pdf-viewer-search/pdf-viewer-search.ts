import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Checkbox } from '@ngstarter-ui/components/checkbox';
import { FormField, IconButtonSuffix, IconPrefix } from '@ngstarter-ui/components/form-field';
import { Icon } from '@ngstarter-ui/components/icon';
import { Input as NgsInput } from '@ngstarter-ui/components/input';
import { Panel, PanelContent, PanelHeader, PanelSubheader } from '@ngstarter-ui/components/panel';
import { Toolbar, ToolbarSpacer, ToolbarTitle } from '@ngstarter-ui/components/toolbar';
import type { PdfViewerSearchOptions, PdfViewerSearchResultView } from '../types';

interface PdfViewerSearchResultPart {
  text: string;
  highlight: boolean;
}

interface PdfViewerSearchResultGroup {
  pageNumber: number;
  results: Array<{
    result: PdfViewerSearchResultView;
    index: number;
  }>;
}

@Component({
  selector: 'ngs-pdf-viewer-search',
  standalone: true,
  imports: [
    Button,
    Checkbox,
    FormField,
    Icon,
    IconButtonSuffix,
    IconPrefix,
    NgsInput,
    Panel,
    PanelContent,
    PanelHeader,
    Toolbar,
    ToolbarSpacer,
    ToolbarTitle,
    PanelSubheader,
  ],
  templateUrl: './pdf-viewer-search.html',
  styleUrl: './pdf-viewer-search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngs-pdf-viewer-search',
  },
})
export class PdfViewerSearch {
  results = input<PdfViewerSearchResultView[]>([]);
  query = input('');

  closed = output<void>();
  resultSelected = output<PdfViewerSearchResultView>();
  searchChanged = output<{
    query: string;
    options: PdfViewerSearchOptions;
  }>();

  protected readonly caseSensitive = signal(false);
  protected readonly wholeWord = signal(false);
  protected readonly activeResultIndex = signal(0);
  protected readonly queryValue = signal('');
  protected readonly hasQuery = computed(() => this.queryValue().trim().length > 0);
  protected readonly visibleResultGroups = computed<PdfViewerSearchResultGroup[]>(() => {
    const groups = new Map<number, PdfViewerSearchResultGroup>();

    this.results().forEach((result, index) => {
      const group = groups.get(result.pageNumber) ?? {
        pageNumber: result.pageNumber,
        results: [],
      };

      group.results.push({ result, index });
      groups.set(result.pageNumber, group);
    });

    return [...groups.values()];
  });
  protected readonly resultCountLabel = computed(() => {
    const count = this.results().length;

    return `${count} ${count === 1 ? 'result' : 'results'} found`;
  });

  constructor() {
    effect(() => {
      const query = this.query();

      untracked(() => {
        this.queryValue.set(query);
        this.activeResultIndex.set(0);
      });
    });
  }

  protected setQuery(event: Event): void {
    this.queryValue.set((event.target as HTMLInputElement).value);
    this.activeResultIndex.set(0);
    this.emitSearchChanged();
  }

  protected clearQuery(): void {
    this.queryValue.set('');
    this.activeResultIndex.set(0);
    this.emitSearchChanged();
  }

  protected setCaseSensitive(value: boolean): void {
    this.caseSensitive.set(value);
    this.activeResultIndex.set(0);
    this.emitSearchChanged();
  }

  protected setWholeWord(value: boolean): void {
    this.wholeWord.set(value);
    this.activeResultIndex.set(0);
    this.emitSearchChanged();
  }

  protected previousResult(): void {
    const count = this.results().length;

    if (count === 0) {
      return;
    }

    this.activeResultIndex.update((index) => (index - 1 + count) % count);
  }

  protected nextResult(): void {
    const count = this.results().length;

    if (count === 0) {
      return;
    }

    this.activeResultIndex.update((index) => (index + 1) % count);
  }

  protected selectResult(result: PdfViewerSearchResultView, index: number): void {
    this.activeResultIndex.set(index);
    this.resultSelected.emit(result);
  }

  protected resultParts(result: PdfViewerSearchResultView): PdfViewerSearchResultPart[] {
    const query = this.queryValue().trim();

    if (!query) {
      return [{ text: result.excerpt, highlight: false }];
    }

    const flags = this.caseSensitive() ? 'g' : 'gi';
    const escapedQuery = this.escapeRegExp(query);
    const pattern = this.wholeWord()
      ? new RegExp(`\\b${escapedQuery}\\b`, flags)
      : new RegExp(escapedQuery, flags);
    const parts: PdfViewerSearchResultPart[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(result.excerpt)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: result.excerpt.slice(lastIndex, match.index), highlight: false });
      }

      parts.push({ text: match[0], highlight: true });
      lastIndex = match.index + match[0].length;

      if (match[0].length === 0) {
        pattern.lastIndex++;
      }
    }

    if (lastIndex < result.excerpt.length) {
      parts.push({ text: result.excerpt.slice(lastIndex), highlight: false });
    }

    return parts.length > 0 ? parts : [{ text: result.excerpt, highlight: false }];
  }

  private emitSearchChanged(): void {
    this.searchChanged.emit({
      query: this.queryValue(),
      options: {
        caseSensitive: this.caseSensitive(),
        wholeWord: this.wholeWord(),
      },
    });
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
