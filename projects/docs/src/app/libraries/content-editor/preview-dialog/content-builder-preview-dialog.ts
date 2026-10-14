import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  ContentEditorConfig,
  ContentEditorDocument,
  ContentEditorRenderer,
} from '@ngstarter-ui/components/content-editor';
import {
  DIALOG_DATA,
  DialogActions,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@ngstarter-ui/components/dialog';
import { Button } from '@ngstarter-ui/components/button';
import { EmptyState } from '@ngstarter-ui/components/empty-state';

export interface ContentBuilderPreviewDialogData {
  document: ContentEditorDocument;
  config?: ContentEditorConfig;
}

@Component({
  selector: 'app-content-builder-preview-dialog',
  imports: [
    Button,
    ContentEditorRenderer,
    DialogActions,
    DialogClose,
    DialogContent,
    DialogTitle,
    EmptyState,
  ],
  templateUrl: './content-builder-preview-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './content-builder-preview-dialog.scss',
})
export class ContentBuilderPreviewDialog {
  readonly data = inject<ContentBuilderPreviewDialogData>(DIALOG_DATA);
}
