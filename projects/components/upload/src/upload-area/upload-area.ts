import {
  booleanAttribute,
  Component,
  inject, input,
  output,
  Renderer2, signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { UploadFileSelectedEvent } from '../types';

@Component({
  selector: 'ngs-upload-area',
  exportAs: 'ngsUploadArea',
  templateUrl: './upload-area.html',
  styleUrl: './upload-area.scss',
  imports: [
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-upload-area',
    '[class.is-drop-active]': 'isDropActive()',
    '[class.is-drop-invalid]': 'isDropInvalid()',
    '[class.is-allow-hover]': 'allowHover()',
    '(dragover)': 'handleDragOver($event)',
    '(dragenter)': 'handleDragEnter($event)',
    '(dragleave)': 'handleDragLeave($event)',
    '(dragend)': 'handleDragEnd($event)',
    '(drop)': 'handleDrop($event)',
  }
})
export class UploadArea {
  protected _renderer = inject(Renderer2);

  accept = input<string>();
  allowHover = input(true, {
    transform: booleanAttribute
  });
  multiple = input(false, {
    transform: booleanAttribute
  });

  readonly fileSelected = output<UploadFileSelectedEvent>();
  protected isDropActive = signal(false);
  protected isDropInvalid = signal(false);

  get api() {
    return {
      isDropActive: this.isDropActive()
    }
  }

  protected handleDragOver(event: DragEvent) {
    event.preventDefault();
  }

  protected handleDragEnter(event: DragEvent) {
    if (event.dataTransfer) {
      const accept = this.acceptedMimeTypes();
      const allFilesAreValid = Array.from(event.dataTransfer.items).every(
        item => item.kind === 'file' && this.isMimeTypeAllowed(item.type, accept)
      );

      this.isDropActive.set(allFilesAreValid);
      this.isDropInvalid.set(!allFilesAreValid);
    }

    event.preventDefault();
    event.stopPropagation();
  }

  protected handleDragLeave(event: DragEvent) {
    const { currentTarget, relatedTarget } = event;
    if (!(currentTarget instanceof Node && relatedTarget instanceof Node && currentTarget.contains(relatedTarget))) {
      this.isDropActive.set(false);
      this.isDropInvalid.set(false);
    }

    event.preventDefault();
  }

  protected handleDragEnd(event: DragEvent) {
    this.isDropActive.set(false);
    this.isDropInvalid.set(false);
    event.preventDefault();
  }

  protected handleDrop(event: DragEvent) {
    event.preventDefault();
    this.isDropActive.set(false);
    this.isDropInvalid.set(false);

    const droppedFiles = event.dataTransfer?.files;
    if (!droppedFiles) return;

    const accept = this.acceptedMimeTypes();
    const multiple = this.multiple();
    const acceptedFiles = Array.from(droppedFiles).filter(file => this.isMimeTypeAllowed(file.type, accept));
    const files = multiple ? acceptedFiles : acceptedFiles.slice(0, 1);
    if (!files.length) return;

    let fileList = droppedFiles;
    if (files.length !== droppedFiles.length) {
      const acceptedTransfer = new DataTransfer();
      for (const file of files) acceptedTransfer.items.add(file);
      fileList = acceptedTransfer.files;
    }

    this.fileSelected.emit({ multiple, fileList, event, files });
  }

  private acceptedMimeTypes(): string[] {
    return (this.accept() ?? '').toLowerCase().split(',').map(type => type.trim()).filter(Boolean);
  }

  private isMimeTypeAllowed(
    fileMimeType: string,
    allowedMimeTypes: string[]
  ): boolean {
    const mimeType = fileMimeType.toLowerCase();
    return !allowedMimeTypes.length || allowedMimeTypes.some(allowedType => {
      if (allowedType === '*/*' || allowedType === '*') {
        return true;
      }

      if (allowedType.endsWith('/*')) {
        const baseType = allowedType.slice(0, -2);
        return mimeType.startsWith(`${baseType}/`);
      }

      return mimeType === allowedType;
    });
  }
}
