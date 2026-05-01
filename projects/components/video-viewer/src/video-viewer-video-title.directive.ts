import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[ngsVideoViewerVideoTitle]',
  standalone: true,
})
export class VideoViewerVideoTitleDirective {
  readonly templateRef = inject(TemplateRef);
}
