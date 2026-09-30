import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  CommentEditor,
  CommentEditorCommandDirective,
  CommentEditorCommandImageDirective,
  CommentEditorToolbar
} from '@ngstarter-ui/components/comment-editor';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-comment-editor-with-upload-error-example',
  imports: [
    Button,
    CommentEditor,
    CommentEditorCommandDirective,
    CommentEditorCommandImageDirective,
    CommentEditorToolbar,
    Icon
  ],
  templateUrl: './comment-editor-with-upload-error-example.html',
  styleUrl: './comment-editor-with-upload-error-example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentEditorWithUploadErrorExample {
  protected readonly rejectUpload = (_file: Blob): Promise<string> => (
    Promise.reject(new Error('The image could not be uploaded'))
  );
}
