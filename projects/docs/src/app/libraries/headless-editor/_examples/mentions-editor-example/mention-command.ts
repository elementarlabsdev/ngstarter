import { NgsHeadlessEditorMentionOption } from '@ngstarter-ui/components/headless-editor';

export interface MentionCommand extends NgsHeadlessEditorMentionOption {
  readonly icon: string;
  readonly description: string;
}

export const MENTION_COMMANDS: readonly MentionCommand[] = [
  { id: 'summarize', label: 'summarize', icon: 'fluent:text-bullet-list-24-regular', description: 'Summarize the conversation' },
  { id: 'assign', label: 'assign', icon: 'fluent:person-24-regular', description: 'Assign a teammate' },
  { id: 'remind', label: 'remind', icon: 'fluent:clock-24-regular', description: 'Create a reminder' }
];
