import { Directive, input, TemplateRef } from '@angular/core';
import type {
  PdfViewerAnnotationTemplateContext,
  PdfViewerAnnotationWhen,
  PdfViewerAnnotationView,
} from './types';

@Directive({
  selector: '[ngsPdfViewerAnnotationDef], [ngsPdfViewerAnnotation]',
  standalone: true,
})
export class PdfViewerAnnotationDef {
  readonly annotationWhen = input<PdfViewerAnnotationWhen | undefined>(undefined, {
    alias: 'ngsPdfViewerAnnotation',
  });
  readonly defWhen = input<PdfViewerAnnotationWhen | undefined>(undefined, {
    alias: 'ngsPdfViewerAnnotationDef',
  });
  readonly when = input<PdfViewerAnnotationWhen | undefined>(undefined, {
    alias: 'ngsPdfViewerAnnotationWhen',
  });

  constructor(public template: TemplateRef<PdfViewerAnnotationTemplateContext>) {}

  matches(annotation: PdfViewerAnnotationView, index: number, typeProperty: string): boolean {
    const whenValue = this.whenValue();

    if (!whenValue) {
      return false;
    }

    if (typeof whenValue === 'function') {
      return whenValue(annotation, index);
    }

    return annotation[typeProperty] === whenValue;
  }

  hasWhen(): boolean {
    return !!this.whenValue();
  }

  private whenValue(): PdfViewerAnnotationWhen | undefined {
    return this.when() ?? this.defWhen() ?? this.annotationWhen();
  }
}
