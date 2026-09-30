import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  CommentEditor,
  CommentEditorCommandBoldDirective,
  CommentEditorCommandDirective,
  CommentEditorCommandItalicDirective,
  CommentEditorCommandStrikeDirective,
  CommentEditorToolbar
} from '@ngstarter-ui/components/comment-editor';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-comment-editor-with-toolbar-example',
  imports: [
    Button,
    CommentEditor,
    CommentEditorCommandBoldDirective,
    CommentEditorCommandDirective,
    CommentEditorCommandItalicDirective,
    CommentEditorCommandStrikeDirective,
    CommentEditorToolbar,
    Icon
  ],
  templateUrl: './comment-editor-with-toolbar-example.html',
  styleUrl: './comment-editor-with-toolbar-example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentEditorWithToolbarExample {}
