import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import {
  LayoutAside,
  LayoutContent,
  Layout,
  LayoutFooter,
  LayoutHeader, LayoutSidebar, LayoutSubheader
} from '@ngstarter-ui/components/layout';

@Component({
  selector: 'app-layout-with-extra-columns-example',
  imports: [
    ScrollbarArea,
    LayoutContent,
    Layout,
    LayoutFooter,
    LayoutHeader,
    LayoutSidebar,
    LayoutAside,
    LayoutSubheader
  ],
  templateUrl: './layout-with-extra-columns-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './layout-with-extra-columns-example.scss'
})
export class LayoutWithExtraColumnsExample {
  wideSidebar = signal(false);
}
