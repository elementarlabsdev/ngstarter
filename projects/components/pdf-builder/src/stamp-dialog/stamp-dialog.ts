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
  ListItemAvatar,
  ListItemLine,
  ListItemTitle,
  ListOption,
  SelectionList,
} from '@ngstarter-ui/components/list';
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
import type { PdfBuilderStampAsset } from '../pdf-builder/pdf-builder';

export interface PdfBuilderStampDialogData {
  readonly stamps: readonly PdfBuilderStampAsset[];
}

export type PdfBuilderStampDialogResult =
  | { readonly type: 'asset'; readonly stamp: PdfBuilderStampAsset }
  | { readonly type: 'file'; readonly file: File };

@Component({
  selector: 'ngs-pdf-builder-stamp-dialog',
  imports: [
    Button,
    DialogActions,
    DialogClose,
    DialogContent,
    DialogTitle,
    Icon,
    ListItemAvatar,
    ListItemLine,
    ListItemTitle,
    ListOption,
    SelectionList,
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
  templateUrl: './stamp-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfBuilderStampDialog {
  private readonly dialogRef = inject<DialogRef<PdfBuilderStampDialog, PdfBuilderStampDialogResult>>(DialogRef);
  protected readonly data = inject<PdfBuilderStampDialogData>(DIALOG_DATA);
  protected readonly selectedStamp = signal<PdfBuilderStampAsset | null>(null);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly canApply = computed(() => !!this.selectedStamp() || !!this.selectedFile());

  protected selectStamp(stamp: PdfBuilderStampAsset): void {
    this.selectedStamp.set(stamp);
    this.selectedFile.set(null);
  }

  protected handleFileSelected(event: UploadFileSelectedEvent): void {
    this.selectedFile.set(event.files[0] ?? null);
    this.selectedStamp.set(null);
  }

  protected apply(): void {
    const selectedFile = this.selectedFile();
    const selectedStamp = this.selectedStamp();

    if (selectedFile) {
      this.dialogRef.close({ type: 'file', file: selectedFile });
      return;
    }

    if (selectedStamp) {
      this.dialogRef.close({ type: 'asset', stamp: selectedStamp });
    }
  }
}
