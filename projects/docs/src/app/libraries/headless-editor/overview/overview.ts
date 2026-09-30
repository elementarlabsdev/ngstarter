import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';

import { ToolbarEditorExample } from '../_examples/toolbar-editor-example/toolbar-editor-example';

@Component({
  imports: [
    RouterLink,
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    ToolbarEditorExample
  ],
  templateUrl: './overview.html',
  styleUrl: '../_shared/article.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Overview {

}
