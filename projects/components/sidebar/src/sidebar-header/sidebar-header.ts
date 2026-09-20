import { booleanAttribute, Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-sidebar-header',
  exportAs: 'ngsSidebarHeader',
  templateUrl: './sidebar-header.html',
  styleUrl: './sidebar-header.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-sidebar-header',
    '[class.as-block]': 'block()'
  }
})
export class SidebarHeader {
  block = input(false, {
    transform: booleanAttribute
  });
}
