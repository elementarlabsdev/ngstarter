import {booleanAttribute, Component, input, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'ngs-sidebar-footer',
  exportAs: 'ngsSidebarFooter',
  templateUrl: './sidebar-footer.html',
  styleUrl: './sidebar-footer.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-sidebar-footer',
    '[class.as-block]': 'block()'
  }
})
export class SidebarFooter {
  block = input(false, {
    transform: booleanAttribute
  });
}
