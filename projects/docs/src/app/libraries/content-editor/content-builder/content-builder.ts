import { Component, inject } from '@angular/core';
import { ContentBuilderComponent, ContentEditorBlock } from '@ngstarter-ui/components/content-editor';
import { Button } from '@ngstarter-ui/components/button';
import { Dialog } from '@ngstarter-ui/components/dialog';
import { Icon } from '@ngstarter-ui/components/icon';
import { ContentBuilderPreviewDialog } from '../preview-dialog/content-builder-preview-dialog';

@Component({
  selector: 'app-content-builder',
  imports: [
    Button,
    ContentBuilderComponent,
    Icon
  ],
  templateUrl: './content-builder.html',
  styleUrl: './content-builder.scss',
})
export class ContentBuilder {
  private readonly dialog = inject(Dialog);

  options = {
    image: {
      uploadFn: (file: File, base64: string) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(base64);
          }, 2000);
        });
      }
    },
    video: {
      uploadFn: (file: File, base64: string) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(base64);
          }, 3000);
        });
      }
    }
  };

  openPreview(blocks: ContentEditorBlock[]) {
    this.dialog.open(ContentBuilderPreviewDialog, {
      width: '840px',
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: 'calc(100vh - 32px)',
      data: {
        blocks: this.getPreviewBlocks(blocks)
      }
    });
  }

  private getPreviewBlocks(blocks: ContentEditorBlock[]): ContentEditorBlock[] {
    return blocks
      .filter(block => !(block.type === 'paragraph' && block.isEmpty))
      .map(block => ({
        ...block,
        content: this.cloneBlockValue(block.content),
        props: this.cloneBlockValue(block.props),
        settings: this.cloneBlockValue(block.settings),
      }));
  }

  private cloneBlockValue<T>(value: T): T {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }
}
