import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgsHeadlessEditorMentionOptionComponent } from '@ngstarter-ui/components/headless-editor';
import { MentionEmoji } from '../mention-emoji';

@Component({
  selector: 'app-emoji-option',
  templateUrl: './emoji-option.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmojiOption implements NgsHeadlessEditorMentionOptionComponent<MentionEmoji> {
  readonly option = input.required<MentionEmoji>();
  readonly active = input(false);
}
