import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsImageViewerPictureDescription]',
  standalone: true
})
export class ImageViewerPictureDescriptionDirective {
  readonly templateRef = inject(TemplateRef);
}
