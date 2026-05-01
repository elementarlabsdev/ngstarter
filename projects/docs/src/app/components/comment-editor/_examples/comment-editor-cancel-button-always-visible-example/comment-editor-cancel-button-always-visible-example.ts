import { Component } from '@angular/core';
import {
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
  CommentEditor,
  CommentEditorDivider, CommentEditorFooterBar,
  CommentEditorToolbar
} from '@ngstarter-ui/components/comment-editor';
import { Icon } from '@ngstarter-ui/components/icon';
import { SafeHtmlPipe } from '@ngstarter-ui/components/core';
import { Button } from '@ngstarter-ui/components/button';
import { Tooltip } from '@ngstarter-ui/components/tooltip';

@Component({
  selector: 'app-comment-editor-cancel-button-always-visible-example',
  imports: [
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
    CommentEditor,
    CommentEditorDivider,
    CommentEditorFooterBar,
    CommentEditorToolbar,
    Icon,
    SafeHtmlPipe,
    Button,
    Tooltip
  ],
  templateUrl: './comment-editor-cancel-button-always-visible-example.html',
  styleUrl: './comment-editor-cancel-button-always-visible-example.scss'
})
export class CommentEditorCancelButtonAlwaysVisibleExample {
  comments: string[] = [];

  uploadFn = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('/assets/image-viewer/1.jpg');
      }, 3000);
    });

    // return new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     reject('Upload Error');
    //   }, 3000);
    // });

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
