import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsImageViewerPictureTitle]',
  standalone: true
})
export class ImageViewerPictureTitleDirective {
  readonly templateRef = inject(TemplateRef);
}
