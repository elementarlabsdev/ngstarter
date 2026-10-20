import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  LayoutContent,
  Layout,
  LayoutFooter,
  LayoutHeader,
} from '@ngstarter-ui/components/layout';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';

@Component({
  selector: 'app-layout-workspace-example',
  imports: [
    LayoutContent,
    LayoutFooter,
    LayoutHeader,
    Layout,
    ScrollbarArea
  ],
  templateUrl: './layout-workspace-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './layout-workspace-example.scss'
})
export class LayoutWorkspaceExample {

}
