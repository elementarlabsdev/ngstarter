import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgsHeadlessEditorMentionOptionComponent } from '@ngstarter-ui/components/headless-editor';
import { Icon } from '@ngstarter-ui/components/icon';
import { MentionCommand } from '../mention-command';

@Component({
  selector: 'app-command-option',
  imports: [Icon],
  templateUrl: './command-option.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommandOption implements NgsHeadlessEditorMentionOptionComponent<MentionCommand> {
  readonly option = input.required<MentionCommand>();
  readonly active = input(false);
}
