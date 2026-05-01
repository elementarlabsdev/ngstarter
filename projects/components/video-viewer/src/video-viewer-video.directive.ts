import { booleanAttribute, contentChild, Directive, inject, input } from '@angular/core';
import { VIDEO_VIEWER, VideoViewerOrientation } from './types';
import { VideoViewerDirective } from './video-viewer.directive';
import { VideoViewerVideoCaptionDirective } from './video-viewer-video-caption.directive';
import { VideoViewerVideoDescriptionDirective } from './video-viewer-video-description.directive';
import { VideoViewerVideoTitleDirective } from './video-viewer-video-title.directive';

@Directive({
  selector: '[ngsVideoViewerVideo]',
  exportAs: 'ngsVideoViewerVideo',
  standalone: true,
  providers: [
    {
      provide: VIDEO_VIEWER,
      useExisting: VideoViewerVideoDirective
    }
  ],
  host: {
    'class': 'ngs-video-viewer-video',
    '(click)': 'onClick($event)'
  }
})
export class VideoViewerVideoDirective {
  private _videoViewer = inject(VideoViewerDirective);
  private _titleTplRef = contentChild(VideoViewerVideoTitleDirective);
  private _captionTplRef = contentChild(VideoViewerVideoCaptionDirective);
  private _descriptionTplRef = contentChild(VideoViewerVideoDescriptionDirective);

  sourceUrl = input.required<string>();
  caption = input<string>();
  title = input<string>();
  description = input<string>();

  payload = input<any | null>(null);
  orientation = input<VideoViewerOrientation | undefined>(undefined);
  autoPlay = input(false, {
    transform: booleanAttribute
  });
  showPlayButton = input(true, {
    transform: booleanAttribute
  });
  showSpeaker = input(true, {
    transform: booleanAttribute
  });
  showFullscreen = input(true, {
    transform: booleanAttribute
  });
  showDurationSlider = input(true, {
    transform: booleanAttribute
  });
  muted = input(false, {
    transform: booleanAttribute
  });

  protected onClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this._videoViewer.api.open({
      sourceUrl: this.sourceUrl(),
      title: this.title(),
      caption: this.caption(),
      description: this.description(),
      titleTplRef: this._titleTplRef()?.templateRef,
      captionTplRef: this._captionTplRef()?.templateRef,
      descriptionTplRef: this._descriptionTplRef()?.templateRef,
      payload: this.payload(),
      orientation: this.orientation(),
      autoPlay: this.autoPlay(),
      showPlayButton: this.showPlayButton(),
      showSpeaker: this.showSpeaker(),
      showFullscreen: this.showFullscreen(),
      showDurationSlider: this.showDurationSlider(),
      muted: this.muted()
    });
  }
}
