import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Page } from '@meta/page/page';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    FormsModule,
    Page,
    PageTitleDirective,
  ],
  templateUrl: './typography.html',
  styleUrl: './typography.scss'
})
export class Typography {

}
