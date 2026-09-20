import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-comment-editor-footer-bar',
  exportAs: 'ngsCommentEditorFooterBar',
  templateUrl: './comment-editor-footer-bar.html',
  styleUrl: './comment-editor-footer-bar.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-comment-editor-footer-bar',
  }
})
export class CommentEditorFooterBar {

}
