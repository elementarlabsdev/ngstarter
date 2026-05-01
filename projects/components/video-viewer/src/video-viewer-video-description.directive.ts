import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[ngsVideoViewerVideoDescription]',
  standalone: true,
})
export class VideoViewerVideoDescriptionDirective {
  readonly templateRef = inject(TemplateRef);
}
