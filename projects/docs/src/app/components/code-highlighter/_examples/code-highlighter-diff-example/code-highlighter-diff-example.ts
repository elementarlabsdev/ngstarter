import { Component } from '@angular/core';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';

@Component({
  selector: 'app-code-highlighter-diff-example',
  imports: [
    CodeHighlighter
  ],
  templateUrl: './code-highlighter-diff-example.html',
  styleUrl: './code-highlighter-diff-example.scss'
})
export class CodeHighlighterDiffExample {
  readonly diffSample = `  @Component({
-   selector: 'old-selector',
+   selector: 'new-selector',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
  })
  export class AppComponent {
-   title = 'old-app';
+   title = 'new-app';
  }`;
}
