import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  DIALOG_DATA,
  DialogActions,
  DialogClose,
  DialogContent,
  DialogRef,
  DialogTitle,
} from '@ngstarter-ui/components/dialog';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  SignaturePad,
  TypedSignaturePad,
  type TypedSignaturePadValue,
} from '@ngstarter-ui/components/signature-pad';
import { Tab, TabGroup } from '@ngstarter-ui/components/tabs';
import {
  UploadAllowedTypes,
  UploadArea,
  UploadAreaDropStateDirective,
  UploadAreaIconDirective,
  UploadAreaInvalidStateDirective,
  UploadAreaMainStateDirective,
  UploadContainer,
  UploadFileSelectedEvent,
  UploadTriggerDirective,
} from '@ngstarter-ui/components/upload';
import type { PdfBuilderSignatureAsset } from '../pdf-builder/pdf-builder';

export interface PdfBuilderSignatureDialogData {
  readonly signatures: readonly PdfBuilderSignatureAsset[];
  readonly title?: string;
  readonly includeDraw?: boolean;
  readonly typePlaceholder?: string;
  readonly uploadMainText?: string;
  readonly uploadDropText?: string;
  readonly uploadInvalidText?: string;
  readonly uploadAllowedTypesText?: string;
  readonly savedTabLabel?: string;
  readonly savedListLabel?: string;
  readonly acceptLabel?: string;
}

export type PdfBuilderSignatureDialogResult =
  | { readonly type: 'asset'; readonly signature: PdfBuilderSignatureAsset }
  | { readonly type: 'draw'; readonly dataUrl: string }
  | {
    readonly type: 'type';
    readonly value: string;
    readonly dataUrl: string;
    readonly fontFamily: string;
    readonly color: string;
  }
  | { readonly type: 'file'; readonly file: File };

@Component({
  selector: 'ngs-pdf-builder-signature-dialog',
  imports: [
    Button,
    DialogActions,
    DialogClose,
    DialogContent,
    DialogTitle,
    Icon,
    SignaturePad,
    Tab,
    TabGroup,
    TypedSignaturePad,
    UploadAllowedTypes,
    UploadArea,
    UploadAreaDropStateDirective,
    UploadAreaIconDirective,
    UploadAreaInvalidStateDirective,
    UploadAreaMainStateDirective,
    UploadContainer,
    UploadTriggerDirective,
  ],
  templateUrl: './signature-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfBuilderSignatureDialog {
  private readonly dialogRef = inject<DialogRef<PdfBuilderSignatureDialog, PdfBuilderSignatureDialogResult>>(DialogRef);
  protected readonly data = inject<PdfBuilderSignatureDialogData>(DIALOG_DATA);
  protected readonly title = computed(() => this.data.title ?? 'Signature');
  protected readonly includeDraw = computed(() => this.data.includeDraw ?? true);
  protected readonly typePlaceholder = computed(() => this.data.typePlaceholder ?? 'Type initials or signature');
  protected readonly uploadMainText = computed(() => this.data.uploadMainText ?? 'Drag & drop a signature file here');
  protected readonly uploadDropText = computed(() => this.data.uploadDropText ?? 'Drop signature file here.');
  protected readonly uploadInvalidText = computed(() => this.data.uploadInvalidText ?? 'Select an image file.');
  protected readonly uploadAllowedTypesText = computed(() => this.data.uploadAllowedTypesText ?? 'Image files are accepted.');
  protected readonly savedTabLabel = computed(() => this.data.savedTabLabel ?? 'My Signature');
  protected readonly savedListLabel = computed(() => this.data.savedListLabel ?? 'Saved signatures');
  protected readonly acceptLabel = computed(() => this.data.acceptLabel ?? 'Accept and sign');
  protected readonly selectedSignature = signal<PdfBuilderSignatureAsset | null>(null);
  protected readonly drawnSignature = signal('');
  protected readonly typedSignature = signal<TypedSignaturePadValue | null>(null);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly canApply = computed(() =>
    !!this.selectedSignature() ||
    !!this.drawnSignature() ||
    (this.typedSignature()?.value.trim().length ?? 0) >= 2 ||
    !!this.selectedFile()
  );

  protected handleDrawnSignature(dataUrl: string): void {
    this.drawnSignature.set(dataUrl);
    this.typedSignature.set(null);
    this.selectedFile.set(null);
    this.selectedSignature.set(null);
  }

  protected handleTypedSignature(signature: TypedSignaturePadValue): void {
    this.typedSignature.set(signature);
    this.drawnSignature.set('');
    this.selectedFile.set(null);
    this.selectedSignature.set(null);
  }

  protected handleFileSelected(event: UploadFileSelectedEvent): void {
    this.selectedFile.set(event.files[0] ?? null);
    this.drawnSignature.set('');
    this.typedSignature.set(null);
    this.selectedSignature.set(null);
  }

  protected selectSignature(signature: PdfBuilderSignatureAsset): void {
    this.selectedSignature.set(signature);
    this.drawnSignature.set('');
    this.typedSignature.set(null);
    this.selectedFile.set(null);
  }

  protected getSignatureAssetImage(signature: PdfBuilderSignatureAsset): string {
    return signature.dataUrl?.trim() || signature.imageUrl?.trim() || '';
  }

  protected apply(): void {
    const selectedSignature = this.selectedSignature();
    const selectedFile = this.selectedFile();
    const drawnSignature = this.drawnSignature();
    const typedSignature = this.typedSignature();

    if (selectedSignature) {
      this.dialogRef.close({ type: 'asset', signature: selectedSignature });
      return;
    }

    if (drawnSignature) {
      this.dialogRef.close({ type: 'draw', dataUrl: drawnSignature });
      return;
    }

    if (typedSignature && typedSignature.value.trim().length >= 2) {
      this.dialogRef.close({
        type: 'type',
        value: typedSignature.value.trim(),
        dataUrl: typedSignature.dataUrl,
        fontFamily: typedSignature.fontFamily,
        color: typedSignature.color,
      });
      return;
    }

    if (selectedFile) {
      this.dialogRef.close({ type: 'file', file: selectedFile });
    }
  }
}
