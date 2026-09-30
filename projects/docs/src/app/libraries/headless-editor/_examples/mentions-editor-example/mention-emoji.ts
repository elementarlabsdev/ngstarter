import { NgsHeadlessEditorMentionOption } from '@ngstarter-ui/components/headless-editor';

export interface MentionEmoji extends NgsHeadlessEditorMentionOption {
  readonly text: string;
  readonly description: string;
}

export const MENTION_EMOJI: readonly MentionEmoji[] = [
  { id: 'smile', label: 'smile:', text: '😊', description: 'Smiling face' },
  { id: 'wave', label: 'wave:', text: '👋', description: 'Say hello' },
  { id: 'rocket', label: 'rocket:', text: '🚀', description: 'Ready to launch' }
];
