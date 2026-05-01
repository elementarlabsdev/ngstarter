import { Directive, input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsNavigationItemDef]',
  standalone: true
})
export class NavigationItemDefDirective {
  when = input<string | ((item: any) => boolean) | undefined>(undefined, { alias: 'ngsNavigationItemDef' });

  constructor(public template: TemplateRef<any>) {}
}
