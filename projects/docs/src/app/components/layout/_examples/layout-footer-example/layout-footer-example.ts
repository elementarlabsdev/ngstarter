import { Component, ChangeDetectionStrategy } from '@angular/core';
import { LayoutContent, Layout, LayoutFooter } from '@ngstarter-ui/components/layout';

@Component({
  selector: 'app-layout-footer-example',
  imports: [
    LayoutContent,
    Layout,
    LayoutFooter
  ],
  templateUrl: './layout-footer-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './layout-footer-example.scss'
})
export class LayoutFooterExample {

}
