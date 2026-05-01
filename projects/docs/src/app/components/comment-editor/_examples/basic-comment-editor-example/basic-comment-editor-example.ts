import { Component } from '@angular/core';
import {
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
  CommentEditorDivider,
  CommentEditorToolbar,
  CommentEditorCommandLinkDirective,
  CommentEditorBubbleMenu,
  CommentEditorCommandCodeDirective,
  CommentEditorCommandUnsetLinkDirective,
  CommentEditorCommandEditLinkDirective,
  CommentEditorCommandToggleToolbarDirective, CommentEditorFooterBar
} from '@ngstarter/components/comment-editor';
import { SafeHtmlPipe } from '@ngstarter/components/core';
import { Icon } from '@ngstarter/components/icon';
import { Button } from '@ngstarter/components/button';
import { Tooltip } from '@ngstarter/components/tooltip';

@Component({
  selector: 'app-basic-comment-editor-example',
  imports: [
    CommentEditor,
    CommentEditorDivider,
    CommentEditorBubbleMenu,
    SafeHtmlPipe,
    Icon,
    CommentEditorCommandDirective,
    CommentEditorCommandBoldDirective,
    CommentEditorCommandItalicDirective,
    CommentEditorCommandStrikeDirective,
    CommentEditorCommandBulletListDirective,
    CommentEditorCommandOrderedListDirective,
    CommentEditorCommandBlockquoteDirective,
    CommentEditorCommandCodeBlockDirective,
    CommentEditorCommandImageDirective,
    CommentEditorCommandYoutubeDirective,
    CommentEditorToolbar,
    CommentEditorCommandLinkDirective,
    CommentEditorCommandCodeDirective,
    CommentEditorCommandUnsetLinkDirective,
    CommentEditorCommandEditLinkDirective,
    CommentEditorFooterBar,
    CommentEditorCommandToggleToolbarDirective,
    Button,
    Tooltip
  ],
  templateUrl: './basic-comment-editor-example.html',
  styleUrl: './basic-comment-editor-example.scss'
})
export class BasicCommentEditorExample {
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
