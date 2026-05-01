import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsKanbanItemDef]'
})
export class KanbanItemDefDirective {
  readonly templateRef = inject(TemplateRef);
}
