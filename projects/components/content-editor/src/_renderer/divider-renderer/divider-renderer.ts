import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Divider } from '@ngstarter-ui/components/divider';
import { ContentEditorBlock } from '../../types';

@Component({
  selector: 'ngs-content-editor-divider-renderer',
  imports: [
    Divider,
  ],
  templateUrl: './divider-renderer.html',
  styleUrl: './divider-renderer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-content-editor-divider-renderer',
  },
})
export class ContentEditorDividerRenderer {
  block = input<ContentEditorBlock | null>(null);
}
