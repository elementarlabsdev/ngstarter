import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[ngsVideoViewerVideoCaption]',
  standalone: true,
})
export class VideoViewerVideoCaptionDirective {
  readonly templateRef = inject(TemplateRef);
}
