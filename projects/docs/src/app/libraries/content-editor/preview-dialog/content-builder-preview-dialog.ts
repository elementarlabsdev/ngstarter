import { Component, Inject } from '@angular/core';
import {
  ContentEditorBlock,
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
  blocks: ContentEditorBlock[];
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
  styleUrl: './content-builder-preview-dialog.scss',
})
export class ContentBuilderPreviewDialog {
  constructor(@Inject(DIALOG_DATA) public data: ContentBuilderPreviewDialogData) {
  }
}
