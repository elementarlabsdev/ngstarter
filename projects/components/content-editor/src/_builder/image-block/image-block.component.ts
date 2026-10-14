import { ContentEditorUploadBlockBase } from '../upload-block-base';
import { ContentEditorUploadStatus } from '../upload-status/upload-status';
import { ChangeDetectionStrategy, Component, effect, untracked, forwardRef, model, OnInit, signal } from '@angular/core';
import { UploadArea, UploadFileSelectedEvent, UploadTriggerDirective } from '@ngstarter-ui/components/upload';
import {
  CONTENT_EDITOR_BLOCK,
  ContentEditorImageBlockSettings,
  ContentEditorImageContent
} from '../../types';
import { ImageResizer, ImageResizerImageDirective } from '@ngstarter-ui/components/image-resizer';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ngs-image-block',
  imports: [
    ContentEditorUploadStatus,
    UploadArea,
    UploadTriggerDirective,
    ImageResizer,
    FormField,
    Input,
    FormsModule,
    ImageResizerImageDirective,
    Label
  ],
  providers: [
    {
      provide: CONTENT_EDITOR_BLOCK,
      useExisting: forwardRef(() => ImageBlockComponent),
      multi: true
    }
  ],
  templateUrl: './image-block.component.html',
  styleUrl: './image-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keypress)': 'handleKeyPress($event)',
  }
})
export class ImageBlockComponent extends ContentEditorUploadBlockBase<ContentEditorImageContent, ContentEditorImageBlockSettings> implements OnInit {

  protected _src = signal<string>('');
  protected _alt = model<string>('');
  protected _settings = model<ContentEditorImageBlockSettings>({});

  constructor() {
    super();
    effect(() => {
      const content = this.content();
      const settings = this.settings();
      untracked(() => {
        this._src.set(content.src);
        this._alt.set(content.alt);
        this._settings.set({ ...settings });
      });
    });
  }

  ngOnInit() {
    this._src.set(this.content().src);
    this._alt.set(this.content().alt);
    this._settings.set(this.settings() || {});
  }

  override focus() {
    if (this._src()) {
      this.builder.focusBlock(this.id());
    }
  }

  override getData(): any {
    return {
      content: {
        src: this._src(),
        alt: this._alt()
      },
      settings: {
        ...this._settings(),
      }
    };
  }

  override isEmpty(): boolean {
    const src = this.getData().content.src;
    return typeof src === 'string' ? src.trim().length === 0 : !src;
  }

  protected onFileSelected(event: UploadFileSelectedEvent): Promise<void> {
    return this.uploadFiles('image', { files: event.files.slice(0, 1), accept: file => file.type.startsWith('image/'), apply: results => {
      this._src.set(results[0].url);
      this.update();
    } });
  }

  protected _onAltChange() {
    this.update();
  }

  protected _onImageResized(options: any) {
    this._settings.set(options);
    this.update();
  }

  protected handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      this.builder.insertEmptyBlock(this.index());
    }
  }

  private update() {
    this.store.updateBlock(this.id(), {...this.getData(), isEmpty: this.isEmpty()});
    this.builder.emitContentChangeEvent();
  }
}
