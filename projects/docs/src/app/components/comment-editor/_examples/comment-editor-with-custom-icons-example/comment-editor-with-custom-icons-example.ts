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
  selector: 'app-comment-editor-with-custom-icons-example',
  imports: [
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
    SafeHtmlPipe,
    Icon,
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
  templateUrl: './comment-editor-with-custom-icons-example.html',
  styleUrl: './comment-editor-with-custom-icons-example.scss'
})
export class CommentEditorWithCustomIconsExample {
  comments: string[] = [];

  uploadFn = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('/assets/image-viewer/1.jpg');
      }, 3000);
    });
  }

  onSent(content: string): void {
    this.comments.unshift(content);
  }
}
