import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BareEditorExample } from '../_examples/bare-editor-example/bare-editor-example';
import { PluginEditorExample } from '../_examples/plugin-editor-example/plugin-editor-example';

@Component({
  selector: 'app-overview',
  imports: [Playground, BareEditorExample, PluginEditorExample],
  templateUrl: './overview.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Overview {}
