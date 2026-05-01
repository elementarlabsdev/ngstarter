import { Component } from '@angular/core';
import {
  LayoutContent,
  Layout,
  LayoutFooter,
  LayoutHeader
} from '@ngstarter-ui/components/layout';

@Component({
  selector: 'app-layout-header-with-footer-example',
  imports: [
    LayoutContent,
    Layout,
    LayoutFooter,
    LayoutHeader
  ],
  templateUrl: './layout-header-with-footer-example.html',
  styleUrl: './layout-header-with-footer-example.scss'
})
export class LayoutHeaderWithFooterExample {

}
