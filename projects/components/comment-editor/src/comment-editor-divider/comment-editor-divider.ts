import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-comment-editor-divider',
  templateUrl: './comment-editor-divider.html',
  styleUrl: './comment-editor-divider.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentEditorDivider {}
