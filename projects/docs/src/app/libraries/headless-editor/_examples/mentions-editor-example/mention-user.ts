import { NgsHeadlessEditorMentionOption } from '@ngstarter-ui/components/headless-editor';

export interface MentionUser extends NgsHeadlessEditorMentionOption {
  readonly role: string;
  readonly team: string;
}

export const MENTION_USERS: readonly MentionUser[] = [
  { id: 'anna', label: 'Anna Chen', role: 'Product designer', team: 'Design' },
  { id: 'alex', label: 'Alex Morgan', role: 'Frontend engineer', team: 'Engineering' },
  { id: 'sam', label: 'Sam Rivera', role: 'Product manager', team: 'Product' },
  { id: 'jordan', label: 'Jordan Lee', role: 'Support specialist', team: 'Support' }
];
