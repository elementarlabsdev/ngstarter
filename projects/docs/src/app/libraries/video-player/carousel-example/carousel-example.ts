import { Component, signal } from '@angular/core';
import { VideoPlayer } from "@ngstarter/components/video-player";
import {
  Carousel,
  CarouselCard,
  CarouselNextDirective,
  CarouselPreviousDirective,
  CarouselControlsDirective
} from "@ngstarter/components/carousel";
import { Icon } from "@ngstarter/components/icon";
import { Button } from "@ngstarter/components/button";
import {
  DataViewColumnSettingsExample
} from "../../data-view/_examples/data-view-column-settings-example/data-view-column-settings-example";
import {Page} from "@meta/page/page";
import {PageContentDirective} from "@meta/page/page-content.directive";
import {PageTitleDirective} from "@meta/page/page-title.directive";
import {Playground} from "@meta/playground/playground";

@Component({
  selector: 'app-carousel-example',
  imports: [
    VideoPlayer,
    Carousel,
    CarouselCard,
    CarouselNextDirective,
    CarouselPreviousDirective,
    CarouselControlsDirective,
    Icon,
    Button,
    DataViewColumnSettingsExample,
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground
  ],
  templateUrl: './carousel-example.html',
})
export class CarouselExample {
  videos = signal([
    {
      title: 'Video 1',
      src: '/video.mp4',
      thumbnail: 'https://vjs.zencdn.net/v/oceans.png'
    },
    {
      title: 'Video 2',
      src: '/video.mp4',
      thumbnail: 'https://vjs.zencdn.net/v/oceans.png'
    },
    {
      title: 'Video 3',
      src: '/video.mp4',
      thumbnail: 'https://vjs.zencdn.net/v/oceans.png'
    }
  ]);
}
