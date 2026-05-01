import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsMenuContent]',
  standalone: true
})
export class MenuContent {
  readonly templateRef = inject(TemplateRef);
}
