import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { BasicPdfSignerExample } from '../_examples/basic-pdf-signer-example/basic-pdf-signer-example';

@Component({
  selector: 'app-pdf-signer-overview',
  imports: [
    BasicPdfSignerExample,
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
  ],
  templateUrl: './overview.html',
})
export class Overview {}
