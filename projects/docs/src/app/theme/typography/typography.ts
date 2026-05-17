import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { Page } from '@meta/page/page';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    CodeHighlighter,
    FormsModule,
    Page,
    PageTitleDirective,
  ],
  templateUrl: './typography.html',
  styleUrl: './typography.scss'
})
export class Typography {
  fontLink = signal(`<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">`);

  themeFontToken = signal(`:root,
[data-ngs-theme='default'] {
  --ngs-font-family-base: "Source Sans 3", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}`);

  customThemeFont = signal(`[data-ngs-theme='acme'] {
  --ngs-font-family-base: "Source Sans 3", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}`);
}
