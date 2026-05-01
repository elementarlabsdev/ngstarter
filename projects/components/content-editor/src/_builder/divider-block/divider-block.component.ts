import { Component, input, signal } from '@angular/core';
import { Divider } from '@ngstarter/components/divider';
import { ContentEditorDataBlock } from '../../types';
import { ContentEditorCodeBlockSettings } from '../code-block/code-block.component';

@Component({
  selector: 'ngs-divider-block',
  imports: [
    Divider
  ],
  templateUrl: './divider-block.component.html',
  styleUrl: './divider-block.component.scss'
})
export class DividerBlockComponent implements ContentEditorDataBlock {
  id = input.required<string>();
  content = input.required<string>();
  settings = input.required<ContentEditorCodeBlockSettings>();
  index = input.required<number>();

  readonly initialized = signal(true);

  getData(): any {
    return {
      content: null,
      settings: this.settings()
    };
  }

  isEmpty(): boolean {
    return true;
  }

  focus() {
  }
}
