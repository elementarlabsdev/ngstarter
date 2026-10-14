import { ContentEditorUploadBlockBase } from '../upload-block-base';
import { ContentEditorUploadStatus } from '../upload-status/upload-status';
import { ChangeDetectionStrategy, Component, effect, untracked, forwardRef, model, OnInit, signal, viewChild, ElementRef } from '@angular/core';
import { UploadArea, UploadFileSelectedEvent, UploadTriggerDirective } from '@ngstarter-ui/components/upload';
import {
  CONTENT_EDITOR_BLOCK,
  ContentEditorVideoBlockSettings,
  ContentEditorVideoContent
} from '../../types';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { FormsModule } from '@angular/forms';
import { ResizableContainer } from '@ngstarter-ui/components/resizable-container';

@Component({
  selector: 'ngs-video-block',
  imports: [
    ContentEditorUploadStatus,
    UploadArea,
    UploadTriggerDirective,
    FormField,
    Input,
    FormsModule,
    Label,
    ResizableContainer
  ],
  providers: [
    {
      provide: CONTENT_EDITOR_BLOCK,
      useExisting: forwardRef(() => VideoBlockComponent),
      multi: true
    }
  ],
  templateUrl: './video-block.component.html',
  styleUrl: './video-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keypress)': 'handleKeyPress($event)',
    'class': 'block'
  }
})
export class VideoBlockComponent extends ContentEditorUploadBlockBase<ContentEditorVideoContent, ContentEditorVideoBlockSettings> implements OnInit {

  protected _src = signal<string>('');
  protected _caption = model<string>('');
  protected _orientation = signal<'portrait' | 'landscape'>('landscape');
  protected _settings = model<ContentEditorVideoBlockSettings>({});

  readonly videoElement = viewChild<ElementRef<HTMLVideoElement>>('videoPlayer');

  private _aspectRatio = 16 / 9;

  constructor() {
    super();
    effect(() => {
      const content = this.content();
      const settings = this.settings();
      untracked(() => {
        this._src.set(content.src);
        this._caption.set(content.caption);
        this._orientation.set(content.orientation || 'landscape');
        this._settings.set({ ...settings });
      });
    });
  }

  ngOnInit() {
    this._src.set(this.content().src);
    this._caption.set(this.content().caption);
    this._orientation.set(this.content().orientation || 'landscape');
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
        caption: this._caption(),
        orientation: this._orientation()
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
    return this.uploadFiles('video', { files: event.files.slice(0, 1), accept: file => file.type.startsWith('video/'), apply: results => {
      this._src.set(results[0].url);
      this.update();
    } });
  }

  protected _onCaptionChange() {
    this.update();
  }

  protected _onVideoResized(event: { width: number }) {
    let width = event.width;
    if (width > 704) {
      width = 704;
    }
    const height = Math.round(width / this._aspectRatio);

    this._settings.update(s => ({
      ...s,
      width,
      height
    }));

    this.update();
  }

  protected _onVideoLoaded(event: any) {
    const video = event.target as HTMLVideoElement;
    this._aspectRatio = video.videoWidth / video.videoHeight;
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
