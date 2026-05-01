import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsUploadAreaDropState]'
})
export class UploadAreaDropStateDirective {
  readonly templateRef = inject(TemplateRef, { optional: true });
}
