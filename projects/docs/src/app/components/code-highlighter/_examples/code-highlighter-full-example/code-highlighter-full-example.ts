import { Component } from '@angular/core';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';

@Component({
  selector: 'app-code-highlighter-full-example',
  standalone: true,
  imports: [CodeHighlighter],
  templateUrl: './code-highlighter-full-example.html',
})
export class CodeHighlighterFullExample {
  code = `import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<h1>Hello World</h1>'
})
export class AppComponent {}`;
}
