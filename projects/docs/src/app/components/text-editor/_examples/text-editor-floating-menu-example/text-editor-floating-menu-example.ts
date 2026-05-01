import { Component } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import {
  TextEditorBubbleMenu,
  TextEditorCommandBlockquoteDirective,
  TextEditorCommandBoldDirective,
  TextEditorCommandBulletListDirective,
  TextEditorCommandCodeBlockDirective,
  TextEditorCommandCodeDirective,
  TextEditorCommandDirective,
  TextEditorCommandEditLinkDirective,
  TextEditorCommandHeadingDirective,
  TextEditorCommandHorizontalRuleDirective,
  TextEditorCommandImageDirective,
  TextEditorCommandItalicDirective,
  TextEditorCommandLinkDirective,
  TextEditorCommandOrderedListDirective,
  TextEditorCommandStrikeDirective,
  TextEditorCommandUnsetLinkDirective,
  TextEditorCommandYoutubeDirective,
  TextEditor, TextEditorDivider,
  TextEditorFloatingMenu
} from '@ngstarter/components/text-editor';
import { Tooltip } from '@ngstarter/components/tooltip';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'app-text-editor-floating-menu-example',
  imports: [
    Icon,
    TextEditorBubbleMenu,
    TextEditorFloatingMenu,
    TextEditorCommandBlockquoteDirective,
    TextEditorCommandBoldDirective,
    TextEditorCommandBulletListDirective,
    TextEditorCommandCodeBlockDirective,
    TextEditorCommandCodeDirective,
    TextEditorCommandDirective,
    TextEditorCommandEditLinkDirective,
    TextEditorCommandHeadingDirective,
    TextEditorCommandHorizontalRuleDirective,
    TextEditorCommandImageDirective,
    TextEditorCommandItalicDirective,
    TextEditorCommandLinkDirective,
    TextEditorCommandOrderedListDirective,
    TextEditorCommandStrikeDirective,
    TextEditorCommandUnsetLinkDirective,
    TextEditorCommandYoutubeDirective,
    TextEditor,
    TextEditorDivider,
    Tooltip,
    Button
  ],
  templateUrl: './text-editor-floating-menu-example.html',
  styleUrl: './text-editor-floating-menu-example.scss'
})
export class TextEditorFloatingMenuExample {
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
