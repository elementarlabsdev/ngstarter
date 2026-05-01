import { ElementRef, ModelSignal, TemplateRef } from '@angular/core';

export interface ToolbarBaseItem {
  elementRef: ElementRef;
  hidden: ModelSignal<boolean>;
  template: () => TemplateRef<any>;
}
