import { Component, signal } from '@angular/core';
import { VideoPlayer } from "@ngstarter/components/video-player";

@Component({
  imports: [
    VideoPlayer
  ],
  templateUrl: './basic-example.html',
  styleUrl: './basic-example.scss',
})
export class BasicExample {
  videos = signal([
    {
      title: 'Landscape Video (16:9)',
      src: '/video.mp4',
      payload: { orientation: 'landscape' },
      class: 'w-full max-w-[720px]'
    },
    {
      title: 'Vertical Video (9:16)',
      src: '/video.mp4',
      payload: { orientation: 'landscape' },
      class: 'w-[320px]'
    },
    {
      title: 'Square Format (1:1)',
      src: '/video.mp4',
      payload: { orientation: 'landscape' },
      class: 'w-[450px]'
    },
    {
      title: 'Compact Player',
      src: '/video.mp4',
      payload: { orientation: 'landscape' },
      class: 'w-[280px]'
    }
  ]);
}
