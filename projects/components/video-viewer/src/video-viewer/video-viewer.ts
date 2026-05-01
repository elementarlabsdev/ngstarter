import { Component, computed, inject, signal } from '@angular/core';
import { VIDEO_VIEWER_DATA, VIDEO_VIEWER_REF } from '../types';
import { Icon } from '@ngstarter/components/icon';
import { VideoPlayer } from '@ngstarter/components/video-player';
import { ProgressSpinner } from '@ngstarter/components/spinner';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'ngs-video-viewer',
  exportAs: 'ngsVideoViewer',
  standalone: true,
  imports: [
    Icon,
    VideoPlayer,
    ProgressSpinner,
    NgTemplateOutlet
  ],
  templateUrl: './video-viewer.html',
  styleUrl: './video-viewer.scss',
  host: {
    'class': 'ngs-video-viewer',
  }
})
export class VideoViewer {
  readonly videoViewerRef = inject(VIDEO_VIEWER_REF);
  readonly data = inject(VIDEO_VIEWER_DATA);

  loaded = signal(false);

  hasTitle = computed(() => {
    return !!(this.data.title || this.data.titleTplRef);
  });

  hasAside = computed(() => {
    return !!(this.data.caption || this.data.description || this.data.captionTplRef || this.data.descriptionTplRef);
  });

  onBackdropClick(): void {
    this.videoViewerRef.close();
  }

  onPreventClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onVideoLoaded() {
    setTimeout(() => {
      this.loaded.set(true);
    }, 250);
  }
}
