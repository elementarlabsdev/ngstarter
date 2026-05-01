import { InjectionToken, TemplateRef } from '@angular/core';
import { VideoViewerRef } from './video-viewer-ref';

export type VideoViewerOrientation = 'landscape' | 'portrait' | 'square' | string;

export interface VideoViewerOptions {
  sourceUrl: string;
  title?: string | undefined;
  caption?: string | undefined;
  description?: string | undefined;
  titleTplRef?: TemplateRef<any> | undefined;
  captionTplRef?: TemplateRef<any> | undefined;
  descriptionTplRef?: TemplateRef<any> | undefined;
  // Video player options
  payload?: any | null;
  orientation?: VideoViewerOrientation | undefined;
  autoPlay?: boolean;
  showPlayButton?: boolean;
  showSpeaker?: boolean;
  showFullscreen?: boolean;
  showDurationSlider?: boolean;
  muted?: boolean;
}

export const VIDEO_VIEWER = new InjectionToken('VIDEO_VIEWER');
export const VIDEO_VIEWER_REF = new InjectionToken<VideoViewerRef>('VIDEO_VIEWER_REF');
export const VIDEO_VIEWER_DATA = new InjectionToken<VideoViewerOptions>('VIDEO_VIEWER_DATA');
