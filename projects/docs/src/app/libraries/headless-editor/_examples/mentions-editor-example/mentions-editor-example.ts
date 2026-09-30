import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  basicTextEditorPlugin, createNgsHeadlessEditorDocument, mentionEditorPlugin,
  NgsHeadlessEditor, NgsHeadlessEditorMentionOption, NgsHeadlessEditorMentions,
  NgsHeadlessEditorSurface, provideNgsHeadlessEditor, withHeadlessEditorPlugin
} from '@ngstarter-ui/components/headless-editor';
import { Menu, MenuItem } from '@ngstarter-ui/components/menu';
import { MentionOption } from './mention-option/mention-option';
import { MENTION_USERS } from './mention-user';

@Component({
  selector: 'app-mentions-editor-example',
  imports: [JsonPipe, Button, NgsHeadlessEditorSurface, NgsHeadlessEditorMentions, Menu, MenuItem],
  providers: [provideNgsHeadlessEditor(
    withHeadlessEditorPlugin(basicTextEditorPlugin()),
    withHeadlessEditorPlugin(mentionEditorPlugin({
      options: async query => {
        const search = query.toLocaleLowerCase();
        return MENTION_USERS.filter(user =>
          `${user.label} ${user.role} ${user.team}`.toLocaleLowerCase().includes(search)
        );
      },
      optionComponent: MentionOption
    }))
  )],
  templateUrl: './mentions-editor-example.html',
  styleUrl: './mentions-editor-example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MentionsEditorExample {
  readonly editor = inject(NgsHeadlessEditor);
  readonly selected = signal<NgsHeadlessEditorMentionOption | null>(null);
  readonly customMenu = signal(false);

  constructor() {
    this.editor.setDocument(createNgsHeadlessEditorDocument('Ask a teammate: '));
  }
}
