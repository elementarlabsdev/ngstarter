import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommentEditor } from '@ngstarter-ui/components/comment-editor';

@Component({
  selector: 'app-comment-editor-cancel-button-always-visible-example',
  imports: [CommentEditor],
  templateUrl: './comment-editor-cancel-button-always-visible-example.html',
  styleUrl: './comment-editor-cancel-button-always-visible-example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentEditorCancelButtonAlwaysVisibleExample {}
