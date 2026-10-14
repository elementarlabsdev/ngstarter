import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Alert } from '@ngstarter-ui/components/alert';
import { Button } from '@ngstarter-ui/components/button';
import { ProgressBar } from '@ngstarter-ui/components/progress-bar';
import { ContentEditorUploadTask } from '../../upload-task';

@Component({
  selector: 'ngs-content-editor-upload-status',
  imports: [Alert, Button, ProgressBar],
  templateUrl: './upload-status.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentEditorUploadStatus { readonly task = input.required<ContentEditorUploadTask>(); }
