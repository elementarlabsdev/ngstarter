import { Component, signal } from '@angular/core';
import { VideoPlayer } from "@ngstarter-ui/components/video-player";

@Component({
  selector: 'app-minimal-example',
  standalone: true,
  imports: [
    VideoPlayer
  ],
  templateUrl: './minimal-example.html',
})
export class MinimalExample {
  videos = signal([
    {
      title: 'Minimal Landscape (16:9)',
      src: '/video.mp4',
      thumbnailUrl: 'https://placehold.co/800x450/000000/FFFFFF/png?text=Thumbnail',
      orientation: 'landscape',
      class: 'w-full max-w-[800px]'
    },
    {
      title: 'Minimal Square (1:1)',
      src: '/video.mp4',
      orientation: 'landscape',
      class: 'w-[400px]'
    },
    {
      title: 'Minimal Compact',
      src: '/video.mp4',
      orientation: 'landscape',
      class: 'w-[280px]'
    }
  ]);
}
