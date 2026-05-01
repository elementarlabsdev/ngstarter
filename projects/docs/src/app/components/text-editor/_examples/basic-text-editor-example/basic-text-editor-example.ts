import { Component } from '@angular/core';
import {
  TextEditorBubbleMenu,
  TextEditorCommandBlockquoteDirective,
  TextEditorCommandBoldDirective,
  TextEditorCommandBulletListDirective,
  TextEditorCommandCodeBlockDirective,
  TextEditorCommandCodeDirective,
  TextEditorCommandDirective,
  TextEditorCommandEditLinkDirective, TextEditorCommandHeadingDirective, TextEditorCommandHorizontalRuleDirective,
  TextEditorCommandImageDirective,
  TextEditorCommandItalicDirective,
  TextEditorCommandLinkDirective,
  TextEditorCommandOrderedListDirective,
  TextEditorCommandStrikeDirective,
  TextEditorCommandUnsetLinkDirective,
  TextEditorCommandYoutubeDirective,
  TextEditor,
  TextEditorDivider,
  TextEditorToolbar
} from '@ngstarter/components/text-editor';
import { Icon } from '@ngstarter/components/icon';
import { Button } from '@ngstarter/components/button';
import { Tooltip } from '@ngstarter/components/tooltip';

@Component({
  selector: 'app-basic-text-editor-example',
  imports: [
    TextEditor,
    Icon,
    TextEditorBubbleMenu,
    TextEditorDivider,
    TextEditorToolbar,
    TextEditorCommandDirective,
    TextEditorCommandBoldDirective,
    TextEditorCommandItalicDirective,
    TextEditorCommandStrikeDirective,
    TextEditorCommandBulletListDirective,
    TextEditorCommandOrderedListDirective,
    TextEditorCommandBlockquoteDirective,
    TextEditorCommandCodeBlockDirective,
    TextEditorCommandImageDirective,
    TextEditorCommandYoutubeDirective,
    TextEditorCommandEditLinkDirective,
    TextEditorCommandUnsetLinkDirective,
    TextEditorCommandLinkDirective,
    TextEditorCommandCodeDirective,
    TextEditorCommandHeadingDirective,
    TextEditorCommandHorizontalRuleDirective,
    Button,
    Tooltip
  ],
  templateUrl: './basic-text-editor-example.html',
  styleUrl: './basic-text-editor-example.scss'
})
export class BasicTextEditorExample {
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
}
