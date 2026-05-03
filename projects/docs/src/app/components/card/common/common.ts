import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { TabLink, TabNavBar, TabNavPanel } from '@ngstarter-ui/components/tabs';

@Component({
  selector: 'app-common',
  standalone: true,
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    TabNavBar,
    RouterLink,
    TabLink,
    TabNavPanel,
    RouterOutlet,
  ],
  templateUrl: './common.html',
  styleUrl: './common.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommonComponent {}
