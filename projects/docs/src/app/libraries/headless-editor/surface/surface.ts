import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NativeTable } from '@ngstarter-ui/components/table';
import { RouterLink } from '@angular/router';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { BubbleMenuExample } from '../_examples/bubble-menu-example/bubble-menu-example';

@Component({
  imports: [
    NativeTable,
    RouterLink,
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    CodeHighlighter,
    BubbleMenuExample
  ],
  templateUrl: './surface.html',
  styleUrl: '../_shared/article.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Surface {
  readonly styleCode = ".surface {\n  display: block;\n  min-height: 8rem;\n  padding: 0.75rem 1rem;\n  outline: none;\n\n  &[data-empty] { background: var(--ngs-color-surface-container-lowest); }\n  &[aria-disabled='true'] { color: var(--ngs-color-on-surface-variant); }\n\n  ::ng-deep {\n    > * { margin: 0 0 0.5rem; }\n    strong { font-weight: 700; }\n    code { font-family: ui-monospace, monospace; }\n\n    [data-ngs-headless-editor-placeholder] {\n      position: relative;\n\n      &::before {\n        content: attr(data-ngs-headless-editor-placeholder);\n        position: absolute;\n        inset: 0 auto auto 0;\n        color: var(--ngs-color-neutral-500);\n        pointer-events: none;\n      }\n    }\n  }\n}";
  readonly bubbleCode = "readonly surface = viewChild.required(NgsHeadlessEditorSurface);\nreadonly position = signal<{ top: number; left: number } | null>(null);\n\nconstructor() {\n  effect(() => {\n    this.editor.selection();\n    this.editor.revision();\n    // Measure after the surface has rendered the change.\n    requestAnimationFrame(() => {\n      const rect = this.surface().getSelectionRect();\n      this.position.set(rect ? { top: rect.top, left: rect.left + rect.width / 2 } : null);\n    });\n  });\n}";
}
