import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodeHighlighter } from '@ngstarter/components/code-highlighter';
import { Segmented, SegmentedButton } from '@ngstarter/components/segmented';

@Component({
  selector: 'app-basic-code-highlighter-example',
  imports: [
    FormsModule,
    CodeHighlighter,
    Segmented,
    SegmentedButton
  ],
  templateUrl: './basic-code-highlighter-example.html',
  styleUrl: './basic-code-highlighter-example.scss'
})
export class BasicCodeHighlighterExample {
  readonly sampleTs = `import { Component } from '@angular/core';\n\n@Component({\n  selector: 'hello-world',\n  template: '<h1>Hello, world!</h1>'\n})\nexport class HelloWorld {}`;

  appearance = model<'none' | 'bordered'>('bordered');
}
