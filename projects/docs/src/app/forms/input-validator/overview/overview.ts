import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
// import { Playground } from '@meta/playground/playground';

@Component({
  selector: 'app-overview',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    // Playground
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
