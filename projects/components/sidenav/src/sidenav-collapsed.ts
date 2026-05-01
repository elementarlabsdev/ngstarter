import { Directive, effect, inject, TemplateRef, ViewContainerRef } from '@angular/core';
import { SIDENAV } from './types';
import { Sidenav } from './sidenav/sidenav';

@Directive({
  selector: '[ngsSidenavCollapsed]',
  exportAs: 'ngsSidenavCollapsed',
  standalone: true
})
export class SidenavCollapsed {
  private _templateRef = inject(TemplateRef);
  private _viewContainerRef = inject(ViewContainerRef);
  private _sidenav = inject<Sidenav>(SIDENAV);

  constructor() {
    effect(() => {
      const collapsed = this._sidenav.collapsed();
      const hovered = this._sidenav.isHovered();

      if (collapsed && !hovered) {
        if (this._viewContainerRef.length === 0) {
          this._viewContainerRef.createEmbeddedView(this._templateRef);
        }
      } else {
        this._viewContainerRef.clear();
      }
    });
  }
}
