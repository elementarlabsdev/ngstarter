import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsImageViewerPictureCaption]',
  standalone: true
})
export class ImageViewerPictureCaptionDirective {
  readonly templateRef = inject(TemplateRef);
}
