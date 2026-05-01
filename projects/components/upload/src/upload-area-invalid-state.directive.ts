import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsUploadAreaInvalidState]'
})
export class UploadAreaInvalidStateDirective {
  readonly templateRef = inject(TemplateRef, { optional: true });
}
