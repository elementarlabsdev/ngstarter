import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  basicTextEditorPlugin, createNgsHeadlessEditorDocument, mentionEditorPlugin,
  NgsHeadlessEditor, NgsHeadlessEditorMentionOption, NgsHeadlessEditorMentions,
  NgsHeadlessEditorSurface, provideNgsHeadlessEditor, withHeadlessEditorPlugin
} from '@ngstarter-ui/components/headless-editor';
import { MentionOption } from './mention-option/mention-option';
import { MENTION_USERS } from './mention-user';
import { EmojiOption } from './emoji-option/emoji-option';
import { CommandOption } from './command-option/command-option';
import { MENTION_EMOJI } from './mention-emoji';
import { MENTION_COMMANDS } from './mention-command';

@Component({
  selector: 'app-mentions-editor-example',
  imports: [JsonPipe, Button, NgsHeadlessEditorSurface, NgsHeadlessEditorMentions],
  providers: [provideNgsHeadlessEditor(
    withHeadlessEditorPlugin(basicTextEditorPlugin()),
    withHeadlessEditorPlugin(mentionEditorPlugin([{
      trigger: '@',
      options: async query => {
        const search = query.toLocaleLowerCase();
        return MENTION_USERS.filter(user =>
          `${user.label} ${user.role} ${user.team}`.toLocaleLowerCase().includes(search)
        );
      },
      optionComponent: MentionOption
    }, {
      trigger: ':',
      options: async query => MENTION_EMOJI.filter(emoji =>
        `${emoji.label} ${emoji.description}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())
      ),
      optionComponent: EmojiOption
    }, {
      trigger: '/',
      options: async query => MENTION_COMMANDS.filter(command =>
        `${command.label} ${command.description}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())
      ),
      optionComponent: CommandOption
    }]))
  )],
  templateUrl: './mentions-editor-example.html',
  styleUrl: './mentions-editor-example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MentionsEditorExample {
  readonly editor = inject(NgsHeadlessEditor);
  readonly selected = signal<NgsHeadlessEditorMentionOption | null>(null);

  constructor() {
    this.editor.setDocument(createNgsHeadlessEditorDocument('Ask a teammate: '));
  }
}
