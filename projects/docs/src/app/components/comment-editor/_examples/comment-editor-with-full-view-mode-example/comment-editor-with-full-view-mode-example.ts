import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommentEditor } from '@ngstarter-ui/components/comment-editor';

@Component({
  selector: 'app-comment-editor-with-full-view-mode-example',
  imports: [CommentEditor],
  templateUrl: './comment-editor-with-full-view-mode-example.html',
  styleUrl: './comment-editor-with-full-view-mode-example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentEditorWithFullViewModeExample {}
