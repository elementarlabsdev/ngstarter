import { Directive } from '@angular/core';

@Directive({
  selector: '[ngsDrawerIgnoreOutsideClick]',
  host: {
    'class': 'ngs-drawer-ignore-outside-click'
  }
})
export class DrawerIgnoreOutsideClickDirective {
}
