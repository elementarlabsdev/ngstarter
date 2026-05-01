import { Directive, effect, inject, TemplateRef, ViewContainerRef } from '@angular/core';
import { SIDENAV } from './types';
import { Sidenav } from './sidenav/sidenav';

@Directive({
  selector: '[ngsSidenavExpanded]',
  exportAs: 'ngsSidenavExpanded',
  standalone: true
})
export class SidenavExpanded {
  private _templateRef = inject(TemplateRef);
  private _viewContainerRef = inject(ViewContainerRef);
  private _sidenav = inject<Sidenav>(SIDENAV);

  constructor() {
    effect(() => {
      const collapsed = this._sidenav.collapsed();
      const hovered = this._sidenav.isHovered();

      if (!collapsed || (collapsed && hovered)) {
        if (this._viewContainerRef.length === 0) {
          this._viewContainerRef.createEmbeddedView(this._templateRef);
        }
      } else {
        this._viewContainerRef.clear();
      }
    });
  }
}
