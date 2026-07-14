import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Alert } from '@ngstarter-ui/components/alert';
import { Button } from '@ngstarter-ui/components/button';
import {
  DIALOG_DATA,
  DialogActions,
  DialogClose,
  DialogContent,
  DialogRef,
  DialogTitle,
} from '@ngstarter-ui/components/dialog';
import { FormField } from '@ngstarter-ui/components/form-field';
import { Icon } from '@ngstarter-ui/components/icon';
import { Input } from '@ngstarter-ui/components/input';
import {
  ListItemAvatar,
  ListItemLine,
  ListItemTitle,
  ListOption,
  SelectionList,
} from '@ngstarter-ui/components/list';
import { SignaturePad } from '@ngstarter-ui/components/signature-pad';
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
}

export type PdfBuilderSignatureDialogResult =
  | { readonly type: 'asset'; readonly signature: PdfBuilderSignatureAsset }
  | { readonly type: 'draw'; readonly dataUrl: string }
  | { readonly type: 'type'; readonly value: string }
  | { readonly type: 'file'; readonly file: File };

@Component({
  selector: 'ngs-pdf-builder-signature-dialog',
  imports: [
    Alert,
    Button,
    DialogActions,
    DialogClose,
    DialogContent,
    DialogTitle,
    FormField,
    Icon,
    Input,
    ListItemAvatar,
    ListItemLine,
    ListItemTitle,
    ListOption,
    SelectionList,
    SignaturePad,
    Tab,
    TabGroup,
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
  protected readonly selectedSignature = signal<PdfBuilderSignatureAsset | null>(null);
  protected readonly drawnSignature = signal('');
  protected readonly typedSignature = signal('');
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly canApply = computed(() =>
    !!this.selectedSignature() ||
    !!this.drawnSignature() ||
    this.typedSignature().trim().length >= 2 ||
    !!this.selectedFile()
  );

  protected handleDrawnSignature(dataUrl: string): void {
    this.drawnSignature.set(dataUrl);
    this.typedSignature.set('');
    this.selectedFile.set(null);
    this.selectedSignature.set(null);
  }

  protected handleTypedSignature(value: string): void {
    this.typedSignature.set(value);
    this.drawnSignature.set('');
    this.selectedFile.set(null);
    this.selectedSignature.set(null);
  }

  protected handleFileSelected(event: UploadFileSelectedEvent): void {
    this.selectedFile.set(event.files[0] ?? null);
    this.drawnSignature.set('');
    this.typedSignature.set('');
    this.selectedSignature.set(null);
  }

  protected selectSignature(signature: PdfBuilderSignatureAsset): void {
    this.selectedSignature.set(signature);
    this.drawnSignature.set('');
    this.typedSignature.set('');
    this.selectedFile.set(null);
  }

  protected apply(): void {
    const selectedSignature = this.selectedSignature();
    const selectedFile = this.selectedFile();
    const drawnSignature = this.drawnSignature();
    const typedSignature = this.typedSignature().trim();

    if (selectedSignature) {
      this.dialogRef.close({ type: 'asset', signature: selectedSignature });
      return;
    }

    if (drawnSignature) {
      this.dialogRef.close({ type: 'draw', dataUrl: drawnSignature });
      return;
    }

    if (typedSignature.length >= 2) {
      this.dialogRef.close({ type: 'type', value: typedSignature });
      return;
    }

    if (selectedFile) {
      this.dialogRef.close({ type: 'file', file: selectedFile });
    }
  }
}
