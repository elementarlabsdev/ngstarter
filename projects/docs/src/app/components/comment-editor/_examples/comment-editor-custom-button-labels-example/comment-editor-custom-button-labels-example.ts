import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommentEditor } from '@ngstarter-ui/components/comment-editor';

@Component({
  selector: 'app-comment-editor-custom-button-labels-example',
  imports: [CommentEditor],
  templateUrl: './comment-editor-custom-button-labels-example.html',
  styleUrl: './comment-editor-custom-button-labels-example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentEditorCustomButtonLabelsExample {}
