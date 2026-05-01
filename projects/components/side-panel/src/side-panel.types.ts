import { TemplateRef } from '@angular/core';

export type PanelPosition = 'left' | 'right';

export interface SidePanelTabConfig {
  tabId: string;
  label: string;
  icon?: string | TemplateRef<any>;
  content: TemplateRef<any>;
}
