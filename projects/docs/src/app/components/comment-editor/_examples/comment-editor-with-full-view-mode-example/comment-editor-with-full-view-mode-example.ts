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
  CommentEditorCommandUnsetLinkDirective, CommentEditorCommandToggleToolbarDirective, CommentEditorFooterBar
} from '@ngstarter/components/comment-editor';
import { Icon } from '@ngstarter/components/icon';
import { SafeHtmlPipe } from '@ngstarter/components/core';
import { Button } from '@ngstarter/components/button';
import { Tooltip } from '@ngstarter/components/tooltip';

@Component({
  selector: 'app-comment-editor-with-full-view-mode-example',
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
  templateUrl: './comment-editor-with-full-view-mode-example.html',
  styleUrl: './comment-editor-with-full-view-mode-example.scss'
})
export class CommentEditorWithFullViewModeExample {
  comments: string[] = [];

  uploadFn = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('/assets/image-viewer/1.jpg');
      }, 3000);
    });

    // upload to a server
    // return new Promise((resolve, reject) => {
    //   const formData = new FormData();
    //   formData.append('image', file);
    //   this._api
    //     .post(`upload`, formData)
    //     .subscribe((res: any) => {
    //       resolve(res.url);
    //     })
    //   ;
    // });
  }

  onSent(content: string): void {
    this.comments.unshift(content);
  }
}
