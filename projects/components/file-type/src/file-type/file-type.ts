import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { FileTypeName } from '../types';

const EXTENSION_TO_TYPE: Record<string, FileTypeName> = {
  avi: 'avi',
  csv: 'csv',
  doc: 'doc',
  docx: 'doc',
  html: 'html',
  htm: 'html',
  jpeg: 'jpg',
  jpg: 'jpg',
  json: 'json',
  jsonld: 'json',
  mkv: 'mkv',
  mov: 'mov',
  mp3: 'mp3',
  m4a: 'mp3',
  mp4: 'mp4',
  pdf: 'pdf',
  png: 'png',
  pot: 'ppt',
  potx: 'ppt',
  pps: 'ppt',
  ppsx: 'ppt',
  ppt: 'ppt',
  pptx: 'ppt',
  svg: 'svg',
  text: 'txt',
  txt: 'txt',
  wav: 'wav',
  webm: 'webm',
  xls: 'xls',
  xlsx: 'xls',
  xml: 'xml',
  zip: 'zip',
};

const MIME_TYPE_TO_TYPE: Record<string, FileTypeName> = {
  'application/csv': 'csv',
  'application/json': 'json',
  'application/ld+json': 'json',
  'application/msword': 'doc',
  'application/pdf': 'pdf',
  'application/rtf': 'doc',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'ppt',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xls',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'doc',
  'application/x-zip-compressed': 'zip',
  'application/xml': 'xml',
  'application/zip': 'zip',
  'audio/mp3': 'mp3',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/wave': 'wav',
  'audio/x-wav': 'wav',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'multipart/x-zip': 'zip',
  'text/comma-separated-values': 'csv',
  'text/csv': 'csv',
  'text/html': 'html',
  'text/json': 'json',
  'text/plain': 'txt',
  'text/xml': 'xml',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
  'video/x-matroska': 'mkv',
  'video/x-msvideo': 'avi',
};

let nextIconId = 0;

@Component({
  selector: 'ngs-file-type',
  exportAs: 'ngsFileType',
  templateUrl: './file-type.html',
  styleUrl: './file-type.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngs-file-type not-prose',
    '[attr.role]': 'decorative() ? null : "img"',
    '[attr.aria-label]': 'decorative() ? null : resolvedLabel()',
    '[attr.aria-hidden]': 'decorative() ? "true" : null',
    '[attr.data-file-type]': 'type()',
  },
})
export class FileType {
  private readonly iconId = `ngs-file-type-${nextIconId++}`;

  mimeType = input<string | null | undefined>();
  extension = input<string | null | undefined>();
  fileName = input<string | null | undefined>();
  fallback = input<FileTypeName>('txt');
  label = input<string | null | undefined>();
  decorative = input(false, { transform: booleanAttribute });

  readonly type = computed<FileTypeName>(() => this.resolveType());

  protected readonly resolvedLabel = computed(() => {
    const label = this.label();

    if (label) {
      return label;
    }

    return `${this.type().toUpperCase()} file`;
  });

  private resolveType(): FileTypeName {
    const extensionType =
      this.resolveExtension(this.extension()) ?? this.resolveExtension(this.fileName());

    if (extensionType) {
      return extensionType;
    }

    const mimeType = this.normalizeMimeType(this.mimeType());

    if (mimeType) {
      return MIME_TYPE_TO_TYPE[mimeType] ?? this.resolveMimeFamily(mimeType) ?? this.fallback();
    }

    return this.fallback();
  }

  private resolveExtension(value: string | null | undefined): FileTypeName | null {
    const extension = this.normalizeExtension(value);

    if (!extension) {
      return null;
    }

    return EXTENSION_TO_TYPE[extension] ?? null;
  }

  private normalizeExtension(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const normalized = value.trim().toLowerCase();

    if (!normalized) {
      return null;
    }

    const fileExtension = normalized.includes('.')
      ? normalized.split('.').pop()
      : normalized.replace(/^\./, '');

    return fileExtension || null;
  }

  private normalizeMimeType(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const mimeType = value.split(';')[0].trim().toLowerCase();

    return mimeType || null;
  }

  private resolveMimeFamily(mimeType: string): FileTypeName | null {
    if (mimeType.startsWith('image/')) {
      return 'png';
    }

    if (mimeType.startsWith('video/')) {
      return 'mp4';
    }

    if (mimeType.startsWith('audio/')) {
      return 'mp3';
    }

    if (mimeType.startsWith('text/')) {
      return 'txt';
    }

    return null;
  }

  protected gradientId(type: FileTypeName): string {
    return `${this.iconId}-${type}-pageGradient`;
  }

  protected gradientUrl(type: FileTypeName): string {
    return `url(#${this.gradientId(type)})`;
  }
}
