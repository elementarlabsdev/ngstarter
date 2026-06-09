import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal, TemplateRef } from '@angular/core';
import { Avatar } from '@ngstarter-ui/components/avatar';
import { Button } from '@ngstarter-ui/components/button';
import {
  Card,
  CardActions,
  CardAside,
  CardAvatar,
  CardContent,
  CardHeader,
  CardSubtitle,
  CardTitle,
} from '@ngstarter-ui/components/card';
import { Chip } from '@ngstarter-ui/components/chips';
import { FormField, IconButtonSuffix, IconPrefix } from '@ngstarter-ui/components/form-field';
import { Icon } from '@ngstarter-ui/components/icon';
import { Input as NgsInput } from '@ngstarter-ui/components/input';
import { Panel, PanelContent, PanelHeader } from '@ngstarter-ui/components/panel';
import { PdfViewerAnnotationDef } from '../pdf-viewer-annotation-def.directive';
import type {
  PdfViewerAnnotationTemplateContext,
  PdfViewerAnnotationView,
} from '../types';

@Component({
  selector: 'ngs-pdf-viewer-annotations',
  standalone: true,
  imports: [
    Avatar,
    Button,
    Card,
    CardActions,
    CardAside,
    CardAvatar,
    CardContent,
    CardHeader,
    CardSubtitle,
    CardTitle,
    Chip,
    FormField,
    Icon,
    IconButtonSuffix,
    IconPrefix,
    NgsInput,
    NgTemplateOutlet,
    Panel,
    PanelContent,
    PanelHeader,
  ],
  templateUrl: './pdf-viewer-annotations.html',
  styleUrl: './pdf-viewer-annotations.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngs-pdf-viewer-annotations',
  },
})
export class PdfViewerAnnotations {
  annotations = input<PdfViewerAnnotationView[]>([]);
  annotationDefs = input<readonly PdfViewerAnnotationDef[]>([]);
  annotationTypeProperty = input('type');

  closed = output<void>();
  pageSelected = output<number>();

  protected readonly filterQuery = signal('');
  protected readonly filteredAnnotations = computed(() => {
    const query = this.filterQuery().trim().toLocaleLowerCase();
    const annotations = this.annotations();

    if (!query) {
      return annotations;
    }

    return annotations.filter((annotation) => this.annotationMatchesFilter(annotation, query));
  });

  protected setFilterQuery(event: Event): void {
    this.filterQuery.set((event.target as HTMLInputElement).value);
  }

  protected clearFilterQuery(): void {
    this.filterQuery.set('');
  }

  protected getAnnotationTemplate(
    annotation: PdfViewerAnnotationView,
    index: number,
  ): TemplateRef<PdfViewerAnnotationTemplateContext> | null {
    const annotationDefs = this.annotationDefs();
    const typeProperty = this.annotationTypeProperty();
    const matchingDef = annotationDefs.find((def) => def.matches(annotation, index, typeProperty))
      ?? annotationDefs.find((def) => !def.hasWhen());

    return matchingDef?.template ?? null;
  }

  protected getAnnotationTemplateContext(
    annotation: PdfViewerAnnotationView,
    index: number,
  ): PdfViewerAnnotationTemplateContext {
    return {
      $implicit: annotation,
      annotation,
      index,
      goToPage: (pageNumber: number) => this.pageSelected.emit(pageNumber),
    };
  }

  protected getAnnotationTypeLabel(annotation: PdfViewerAnnotationView): string {
    const label = annotation.label ?? annotation.type;

    return typeof label === 'string' && label.trim().length > 0 ? label : 'Comment';
  }

  protected getAvatarLabel(annotation: PdfViewerAnnotationView): string {
    const explicitLabel = annotation.avatarLabel;

    if (typeof explicitLabel === 'string' && explicitLabel.trim().length > 0) {
      return explicitLabel.trim();
    }

    return annotation.author
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

  protected getAvatarImage(annotation: PdfViewerAnnotationView): string {
    return typeof annotation.avatarUrl === 'string' ? annotation.avatarUrl : '';
  }

  protected getReplyLabel(annotation: PdfViewerAnnotationView): string {
    return typeof annotation.replyLabel === 'string' && annotation.replyLabel.trim().length > 0
      ? annotation.replyLabel
      : 'Reply';
  }

  private annotationMatchesFilter(annotation: PdfViewerAnnotationView, query: string): boolean {
    return [
      annotation.author,
      annotation.time,
      annotation.text,
      annotation.type,
      annotation.label,
      `page ${annotation.pageNumber}`,
    ]
      .filter((value): value is string => typeof value === 'string')
      .some((value) => value.toLocaleLowerCase().includes(query));
  }
}
