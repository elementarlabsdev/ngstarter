import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
    selector: '[ngsTimelineItemIndicator]',
    exportAs: 'ngsTimelineItemIndicator'
})
export class TimelineItemIndicatorDirective {
  readonly templateRef = inject(TemplateRef);
}
