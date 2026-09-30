import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Avatar } from '@ngstarter-ui/components/avatar';
import { NgsHeadlessEditorMentionOptionComponent } from '@ngstarter-ui/components/headless-editor';
import { MentionUser } from '../mention-user';

/** Registered once in mentionEditorPlugin(), then reused for every menu option. */
@Component({
  selector: 'app-mention-option',
  imports: [Avatar],
  templateUrl: './mention-option.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MentionOption implements NgsHeadlessEditorMentionOptionComponent<MentionUser> {
  readonly option = input.required<MentionUser>();
  readonly active = input(false);
}
