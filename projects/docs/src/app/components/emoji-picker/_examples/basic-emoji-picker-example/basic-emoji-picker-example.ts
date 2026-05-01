import { Component, signal } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { EmojiPicker, EmojiPickerTriggerForDirective } from '@ngstarter-ui/components/emoji-picker';

@Component({
  selector: 'app-basic-emoji-picker-example',
  imports: [
    Button,
    EmojiPicker,
    EmojiPickerTriggerForDirective
  ],
  templateUrl: './basic-emoji-picker-example.html',
  styleUrl: './basic-emoji-picker-example.scss'
})
export class BasicEmojiPickerExample {
  selectedEmoji = signal<string | null>(null);

  onEmojiSelected(emoji: string) {
    this.selectedEmoji.set(emoji);
  }
}
