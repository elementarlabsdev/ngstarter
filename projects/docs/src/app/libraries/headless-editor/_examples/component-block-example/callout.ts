import { createNgsHeadlessEditorId, NgsHeadlessEditorBlock } from '@ngstarter-ui/components/headless-editor';

export type CalloutTone = 'info' | 'success' | 'warning';

export interface CalloutAttributes {
  readonly tone: CalloutTone;
  readonly text: string;
}

export const CALLOUT_TONES: readonly CalloutTone[] = ['info', 'success', 'warning'];

export const CALLOUT_ICONS: Record<CalloutTone, string> = {
  info: 'fluent:info-24-regular',
  success: 'fluent:checkmark-circle-24-regular',
  warning: 'fluent:warning-24-regular'
};

export function createCalloutBlock(attrs: CalloutAttributes): NgsHeadlessEditorBlock<null> {
  return { id: createNgsHeadlessEditorId('callout'), type: 'callout', content: null, attrs: { ...attrs } };
}

export function readCalloutAttributes(block: NgsHeadlessEditorBlock): CalloutAttributes {
  return {
    tone: (block.attrs?.['tone'] as CalloutTone | undefined) ?? 'info',
    text: String(block.attrs?.['text'] ?? '')
  };
}
