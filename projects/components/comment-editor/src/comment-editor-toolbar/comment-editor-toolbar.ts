import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-comment-editor-toolbar',
  exportAs: 'ngsCommentEditorToolbar',
  templateUrl: './comment-editor-toolbar.html',
  styleUrl: './comment-editor-toolbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'ngs-comment-editor-toolbar' }
})
export class CommentEditorToolbar {}
