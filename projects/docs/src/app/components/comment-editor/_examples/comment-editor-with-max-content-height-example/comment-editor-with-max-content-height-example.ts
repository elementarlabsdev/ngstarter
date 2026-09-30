import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommentEditor } from '@ngstarter-ui/components/comment-editor';

@Component({
  selector: 'app-comment-editor-with-max-content-height-example',
  imports: [CommentEditor],
  templateUrl: './comment-editor-with-max-content-height-example.html',
  styleUrl: './comment-editor-with-max-content-height-example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentEditorWithMaxContentHeightExample {}
