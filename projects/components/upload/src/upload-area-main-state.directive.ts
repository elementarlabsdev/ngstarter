import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsUploadAreaMainState]'
})
export class UploadAreaMainStateDirective {
  readonly templateRef = inject(TemplateRef, { optional: true });
}
