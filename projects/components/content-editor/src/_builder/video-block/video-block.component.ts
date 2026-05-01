import { ChangeDetectionStrategy, Component, forwardRef, inject, input, model, OnInit, signal, viewChild, ElementRef } from '@angular/core';
import { UploadArea, UploadFileSelectedEvent, UploadTriggerDirective } from '@ngstarter/components/upload';
import { ProgressBar } from '@ngstarter/components/progress-bar';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import {
  CONTENT_BUILDER,
  CONTENT_EDITOR_BLOCK, ContentEditorDataBlock,
  ContentEditorVideoBlockSettings,
  ContentEditorVideoContent
} from '../../types';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { FormsModule } from '@angular/forms';
import { ContentBuilderStore } from '../../content-builder.store';
import { ContentBuilderComponent } from '../../content-builder/content-builder.component';
import { ResizableContainer } from '@ngstarter/components/resizable-container';

@Component({
  selector: 'ngs-video-block',
  imports: [
    UploadArea,
    UploadTriggerDirective,
    ProgressBar,
    Button,
    Icon,
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
export class VideoBlockComponent implements OnInit, ContentEditorDataBlock {
  private _store = inject(ContentBuilderStore);
  private _contentBuilder = inject<ContentBuilderComponent>(CONTENT_BUILDER);

  id = input.required<string>();
  content = input.required<ContentEditorVideoContent>();
  settings = input.required<ContentEditorVideoBlockSettings>();
  index = input.required<number>();

  uploading = signal(false);
  selectedVideo = signal<string>('');

  protected _src = signal<string>('');
  protected _caption = model<string>('');
  protected _orientation = signal<'portrait' | 'landscape'>('landscape');
  protected _settings = model<ContentEditorVideoBlockSettings>({});
  readonly initialized = signal(false);

  readonly videoElement = viewChild<ElementRef<HTMLVideoElement>>('videoPlayer');

  private _aspectRatio = 16 / 9;

  ngOnInit() {
    this._src.set(this.content().src);
    this._caption.set(this.content().caption);
    this._orientation.set(this.content().orientation || 'landscape');
    this._settings.set(this.settings() || {});
    this.initialized.set(true);
  }

  focus() {
    if (this._src()) {
      this._contentBuilder.focusBlock(this.id());
    }
  }

  getData(): any {
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

  isEmpty(): boolean {
    const src = this.getData().content.src;
    return typeof src === 'string' ? src.trim().length === 0 : !src;
  }

  protected cancelUploading() {
    this.uploading.set(false);
  }

  protected onFileSelected(event: UploadFileSelectedEvent): void {
    this.uploading.set(true);
    const reader  = new FileReader();
    reader.addEventListener('load', () => {
      this.selectedVideo.set(reader.result as string);

      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const orientation = video.videoWidth > video.videoHeight ? 'landscape' : 'portrait';
        this._orientation.set(orientation);
        this._aspectRatio = video.videoWidth / video.videoHeight;

        let width = video.videoWidth;
        let height = video.videoHeight;

        if (width > 704) {
          width = 704;
          height = Math.round(width / this._aspectRatio);
        }

        if (height > 1000) {
          width = Math.round(width / 2);
          height = Math.round(height / 2);
        }

        // Initial settings based on video metadata
        this._settings.update(s => ({
          ...s,
          actualWidth: video.videoWidth,
          actualHeight: video.videoHeight,
          width,
          height
        }));
      };
      video.src = URL.createObjectURL(event.files[0]);

      const uploadFn = this._contentBuilder.getBlockDefOption('video', 'uploadFn');
      uploadFn(event.files[0], reader.result)
        .then((url: string) => {
          if (!this.uploading()) {
            this.selectedVideo.set('');
            return;
          }

          this._src.set(url);
          this.selectedVideo.set('');
          this.uploading.set(false);
          this.update();
          this.focus();
        });
    }, false);
    reader.readAsDataURL(event.files[0]);
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
      this._contentBuilder.insertEmptyBlock(this.index());
    }
  }

  private update() {
    this._store.updateBlock(this.id(), {...this.getData(), isEmpty: this.isEmpty()});
    this._contentBuilder.emitContentChangeEvent();
  }
}
