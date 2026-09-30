import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { MentionsEditorExample } from '../_examples/mentions-editor-example/mentions-editor-example';

@Component({
  imports: [Page, PageContentDirective, PageTitleDirective, Playground, CodeHighlighter, MentionsEditorExample],
  templateUrl: './mentions.html',
  styleUrl: '../_shared/article.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Mentions {
  readonly setupCode = `import {
  basicTextEditorPlugin, mentionEditorPlugin, NgsHeadlessEditorMentions,
  NgsHeadlessEditorSurface, provideNgsHeadlessEditor, withHeadlessEditorPlugin
} from '@ngstarter-ui/components/headless-editor';

@Component({
  imports: [NgsHeadlessEditorSurface, NgsHeadlessEditorMentions],
  providers: [provideNgsHeadlessEditor(
    withHeadlessEditorPlugin(basicTextEditorPlugin()),
    withHeadlessEditorPlugin(mentionEditorPlugin({
      options: async query => users.filter(user =>
        user.label.toLocaleLowerCase().includes(query.toLocaleLowerCase())
      ),
      optionComponent: UserMentionOption
    }))
  )],
  template: '<div ngsHeadlessEditorSurface ngsHeadlessEditorMentions></div>'
})
export class MessageEditor {}`;

  readonly remoteCode = `mentionEditorPlugin<User>({
  options: async query => {
    const response = await fetch('/api/users?search=' + encodeURIComponent(query));
    if (!response.ok) throw new Error('Could not load users');
    return response.json() as Promise<readonly User[]>;
  },
  optionComponent: UserMentionOption
})`;

  readonly componentCode = `import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  NgsHeadlessEditorMentionOption, NgsHeadlessEditorMentionOptionComponent
} from '@ngstarter-ui/components/headless-editor';

interface User extends NgsHeadlessEditorMentionOption {
  readonly role: string;
}

@Component({
  selector: 'app-user-mention-option',
  template: '<span>{{ option().label }}</span> <small>{{ option().role }}</small>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserMentionOption implements NgsHeadlessEditorMentionOptionComponent<User> {
  readonly option = input.required<User>();
  readonly active = input(false);
}`;

  readonly templateCode = `<div ngsHeadlessEditorSurface
  [ngsHeadlessEditorMentions]="mentionMenu"
  #mentions="ngsHeadlessEditorMentions">
</div>

<ngs-menu #mentionMenu>
  @for (user of mentions.suggestions(); track user.id; let index = $index) {
    <ngs-menu-item
      [attr.id]="mentions.optionId(index)"
      [selected]="mentions.activeIndex() === index"
      (click)="mentions.select(user)">
      <app-user-mention-option [option]="user" [active]="mentions.activeIndex() === index"/>
    </ngs-menu-item>
  }
</ngs-menu>`;

  readonly jsonCode = `{
  "type": "text",
  "text": "@Anna Chen",
  "marks": [{ "type": "mention", "attrs": { "id": "anna", "label": "Anna Chen" } }]
}`;
}
