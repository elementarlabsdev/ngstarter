import { Component } from '@angular/core';
import {
  CommentEditorDivider,
  CommentEditorCommandBlockquoteDirective,
  CommentEditorCommandBoldDirective,
  CommentEditorCommandBulletListDirective,
  CommentEditorCommandCodeBlockDirective,
  CommentEditorCommandDirective,
  CommentEditorCommandImageDirective,
  CommentEditorCommandItalicDirective,
  CommentEditorCommandOrderedListDirective,
  CommentEditorCommandStrikeDirective,
  CommentEditorCommandYoutubeDirective,
  CommentEditor,
  CommentEditorToolbar,
  CommentEditorBubbleMenu,
  CommentEditorCommandCodeDirective,
  CommentEditorCommandEditLinkDirective,
  CommentEditorCommandLinkDirective,
  CommentEditorCommandUnsetLinkDirective,
  CommentEditorCommandToggleToolbarDirective,
  CommentEditorFooterBar
} from '@ngstarter/components/comment-editor';
import { SafeHtmlPipe } from '@ngstarter/components/core';
import { Icon } from '@ngstarter/components/icon';
import { Button } from '@ngstarter/components/button';
import { Tooltip } from '@ngstarter/components/tooltip';

@Component({
  selector: 'app-comment-editor-with-upload-error-example',
  imports: [
    CommentEditor,
    SafeHtmlPipe,
    CommentEditorCommandBlockquoteDirective,
    CommentEditorCommandBoldDirective,
    CommentEditorCommandBulletListDirective,
    CommentEditorCommandCodeBlockDirective,
    CommentEditorCommandDirective,
    CommentEditorCommandImageDirective,
    CommentEditorCommandItalicDirective,
    CommentEditorCommandOrderedListDirective,
    CommentEditorCommandStrikeDirective,
    CommentEditorCommandYoutubeDirective,
    Icon,
    CommentEditorDivider,
    CommentEditorToolbar,
    CommentEditorBubbleMenu,
    CommentEditorCommandCodeDirective,
    CommentEditorCommandEditLinkDirective,
    CommentEditorCommandLinkDirective,
    CommentEditorCommandUnsetLinkDirective,
    CommentEditorCommandToggleToolbarDirective,
    CommentEditorFooterBar,
    Button,
    Tooltip
  ],
  templateUrl: './comment-editor-with-upload-error-example.html',
  styleUrl: './comment-editor-with-upload-error-example.scss'
})
export class CommentEditorWithUploadErrorExample {
  comments: string[] = [];

  uploadFn = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject('Upload Error');
      }, 3000);
    });
  }

  onSent(content: string): void {
    this.comments.unshift(content);
  }
}
