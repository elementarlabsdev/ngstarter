import { Component } from '@angular/core';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';

@Component({
  selector: 'app-code-highlighter-with-title-example',
  imports: [
    CodeHighlighter
  ],
  templateUrl: './code-highlighter-with-title-example.html',
  styleUrl: './code-highlighter-with-title-example.scss'
})
export class CodeHighlighterWithTitleExample {
  readonly sampleTs = `import { Component } from '@angular/core';\n\n@Component({\n  selector: 'hello-world',\n  template: '<h1>Hello, world!</h1>'\n})\nexport class HelloWorld {}`;
}
