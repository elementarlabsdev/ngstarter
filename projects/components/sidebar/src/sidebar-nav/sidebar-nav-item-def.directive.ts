import { Directive, input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsSidebarNavItemDef]',
  standalone: true
})
export class SidebarNavItemDefDirective {
  when = input<string | ((item: any) => boolean) | undefined>(undefined, { alias: 'ngsSidebarNavItemDef' });

  constructor(public template: TemplateRef<any>) {}
}
