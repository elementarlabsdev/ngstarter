import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsPopoverContent]',
  standalone: true
})
export class PopoverContent {
  readonly templateRef = inject(TemplateRef);
}
