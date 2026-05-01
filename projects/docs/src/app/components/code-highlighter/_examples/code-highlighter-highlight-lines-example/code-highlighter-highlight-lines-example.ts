import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';

@Component({
  selector: 'app-code-highlighter-highlight-lines-example',
  imports: [CodeHighlighter],
  templateUrl: './code-highlighter-highlight-lines-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeHighlighterHighlightLinesExample {
  code = `import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<h1>Hello World</h1>'
})
export class AppComponent {
  title = 'ngstarter';

  constructor() {
    console.log('AppComponent initialized');
  }
}`;

  highlightedLines = [[4, 6], [10, 12]];
}
