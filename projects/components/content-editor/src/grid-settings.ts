import { ContentEditorGridSettings } from './types';

/** Defaults shared by editing and read-only layout. */
export function contentEditorGridSettings(settings: Partial<ContentEditorGridSettings>): ContentEditorGridSettings {
  return {
    columns: settings.columns === 3 || settings.columns === 4 ? settings.columns : 2,
    gap: settings.gap === 'small' || settings.gap === 'large' ? settings.gap : 'medium',
    stackOnMobile: settings.stackOnMobile !== false
  };
}
