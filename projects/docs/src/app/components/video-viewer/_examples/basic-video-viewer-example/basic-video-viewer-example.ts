import { Component } from '@angular/core';
import { VideoPlayer } from '@ngstarter-ui/components/video-player';
import {
  VideoViewerDirective, VideoViewerVideoDirective
} from '@ngstarter-ui/components/video-viewer';

@Component({
  selector: 'app-basic-video-viewer-example',
  imports: [
    VideoViewerDirective,
    VideoViewerVideoDirective,
    VideoPlayer
  ],
  standalone: true,
  templateUrl: './basic-video-viewer-example.html',
  styleUrl: './basic-video-viewer-example.scss'
})
export class BasicVideoViewerExample {
  videos = [
    {
      src: '/video.mp4',
      poster: null,
      title: 'Local Video 1 (MP4)',
      orientation: 'landscape'
    },
    {
      src: '/video1.mp4',
      poster: null,
      title: 'Local Video 2 (MP4)',
      orientation: 'portrait'
    }
  ];
}
