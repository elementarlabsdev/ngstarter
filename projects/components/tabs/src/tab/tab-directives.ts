import { Directive, InjectionToken, TemplateRef, inject } from '@angular/core';

export const TAB_LABEL = new InjectionToken<TabLabel>('EmrTabLabel');

@Directive({
  selector: '[ngsTabLabel], [ngs-tab-label]',
  standalone: true,
  providers: [{ provide: TAB_LABEL, useExisting: TabLabel }],
})
export class TabLabel {
  template = inject(TemplateRef);
}

export const TAB_CONTENT = new InjectionToken<TabContent>('EmrTabContent');

@Directive({
  selector: '[ngsTabContent], [ngs-tab-content]',
  standalone: true,
  providers: [{ provide: TAB_CONTENT, useExisting: TabContent }],
})
export class TabContent {
  template = inject(TemplateRef);
}
