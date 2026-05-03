import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicCodeHighlighterExample } from '../_examples/basic-code-highlighter-example/basic-code-highlighter-example';
import { CodeHighlighterWithTitleExample } from '../_examples/code-highlighter-with-title-example/code-highlighter-with-title-example';
import { CodeHighlighterDiffExample } from '../_examples/code-highlighter-diff-example/code-highlighter-diff-example';
import { CodeHighlighterHighlightLinesExample } from '../_examples/code-highlighter-highlight-lines-example/code-highlighter-highlight-lines-example';
import { CodeHighlighterFullExample } from '../_examples/code-highlighter-full-example/code-highlighter-full-example';

@Component({
  imports: [
    Playground,
    BasicCodeHighlighterExample,
    CodeHighlighterWithTitleExample,
    CodeHighlighterDiffExample,
    CodeHighlighterHighlightLinesExample,
    CodeHighlighterFullExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Overview {
}
