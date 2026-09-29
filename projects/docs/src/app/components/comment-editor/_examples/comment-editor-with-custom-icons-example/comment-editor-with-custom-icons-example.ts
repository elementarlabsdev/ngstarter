import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  CommentEditor,
  CommentEditorCommandDirective,
  CommentEditorCommandToggleToolbarDirective,
  CommentEditorFooterBar,
  CommentEditorToolbar
} from '@ngstarter-ui/components/comment-editor';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-comment-editor-with-custom-icons-example',
  imports: [
    Button,
    CommentEditor,
    CommentEditorCommandDirective,
    CommentEditorCommandToggleToolbarDirective,
    CommentEditorFooterBar,
    CommentEditorToolbar,
    Icon
  ],
  templateUrl: './comment-editor-with-custom-icons-example.html',
  styleUrl: './comment-editor-with-custom-icons-example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentEditorWithCustomIconsExample {}
