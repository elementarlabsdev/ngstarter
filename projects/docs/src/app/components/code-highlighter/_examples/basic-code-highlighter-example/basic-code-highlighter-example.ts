import { Component } from '@angular/core';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';

@Component({
  selector: 'app-basic-code-highlighter-example',
  imports: [
    CodeHighlighter
  ],
  templateUrl: './basic-code-highlighter-example.html'
})
export class BasicCodeHighlighterExample {
  readonly sampleTs = `import { Component } from '@angular/core';\n\n@Component({\n  selector: 'hello-world',\n  template: '<h1>Hello, world!</h1>'\n})\nexport class HelloWorld {}`;
}
