import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  CommentEditor,
  CommentEditorBubbleMenu,
  CommentEditorCommandBlockquoteDirective,
  CommentEditorCommandBoldDirective,
  CommentEditorCommandBulletListDirective,
  CommentEditorCommandCodeBlockDirective,
  CommentEditorCommandCodeDirective,
  CommentEditorCommandDirective,
  CommentEditorCommandEditLinkDirective,
  CommentEditorCommandImageDirective,
  CommentEditorCommandItalicDirective,
  CommentEditorCommandLinkDirective,
  CommentEditorCommandOrderedListDirective,
  CommentEditorCommandStrikeDirective,
  CommentEditorCommandToggleToolbarDirective,
  CommentEditorCommandUnsetLinkDirective,
  CommentEditorCommandYoutubeDirective,
  CommentEditorDivider,
  CommentEditorFooterBar,
  CommentEditorToolbar
} from '@ngstarter-ui/components/comment-editor';
import { SafeHtmlPipe } from '@ngstarter-ui/components/core';
import { NgsEditorDocument } from '@ngstarter-ui/components/editor';
import { Icon } from '@ngstarter-ui/components/icon';
import { Tooltip } from '@ngstarter-ui/components/tooltip';

@Component({
  selector: 'app-basic-comment-editor-example',
  imports: [
    Button,
    CommentEditor,
    CommentEditorBubbleMenu,
    CommentEditorCommandBlockquoteDirective,
    CommentEditorCommandBoldDirective,
    CommentEditorCommandBulletListDirective,
    CommentEditorCommandCodeBlockDirective,
    CommentEditorCommandCodeDirective,
    CommentEditorCommandDirective,
    CommentEditorCommandEditLinkDirective,
    CommentEditorCommandImageDirective,
    CommentEditorCommandItalicDirective,
    CommentEditorCommandLinkDirective,
    CommentEditorCommandOrderedListDirective,
    CommentEditorCommandStrikeDirective,
    CommentEditorCommandToggleToolbarDirective,
    CommentEditorCommandUnsetLinkDirective,
    CommentEditorCommandYoutubeDirective,
    CommentEditorDivider,
    CommentEditorFooterBar,
    CommentEditorToolbar,
    Icon,
    SafeHtmlPipe,
    Tooltip
  ],
  templateUrl: './basic-comment-editor-example.html',
  styleUrl: './basic-comment-editor-example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicCommentEditorExample {
  protected readonly comments: string[] = [];
  protected submittedDocument: NgsEditorDocument | null = null;

  protected readonly uploadImage = (_file: Blob): Promise<string> => (
    Promise.resolve('/assets/image-viewer/1.jpg')
  );

  protected onSubmitted(document: NgsEditorDocument): void {
    this.submittedDocument = document;
  }

  protected onSent(html: string): void {
    this.comments.unshift(html);
  }
}
