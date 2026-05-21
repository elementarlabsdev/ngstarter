import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Card, CardContent, CardHeader, CardTitle } from '@ngstarter-ui/components/card';
import { Chip, ChipSet } from '@ngstarter-ui/components/chips';

@Component({
  selector: 'app-motion-schema',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Chip,
    ChipSet,
  ],
  templateUrl: './schema.html',
  styleUrl: './schema.scss',
})
export class Schema {
  protected readonly documentExample = JSON.stringify(
    {
      version: 1,
      composition: {
        width: 1080,
        height: 1080,
        fps: 30,
        duration: 9000,
        background: '#0f172a',
      },
      assets: [
        { id: 'product', type: 'image', src: './product.png', name: 'Product render' },
      ],
      scenes: ['intro', 'metrics'],
      layers: ['background', 'headline', 'metric', 'voiceover'],
    },
    null,
    2,
  );

  protected readonly layerExample = JSON.stringify(
    {
      id: 'headline',
      type: 'text',
      name: 'Headline',
      start: 0,
      duration: 3200,
      zIndex: 3,
      layout: { x: 160, y: 180, width: 760, height: 130 },
      style: { color: '#ffffff', fontSize: 72, fontWeight: 800, lineHeight: 1.04 },
      props: { text: 'Revenue motion deck' },
      animations: [
        {
          property: 'opacity',
          easing: 'easeOutCubic',
          keyframes: [
            { time: 0, value: 0 },
            { time: 500, value: 1 },
          ],
        },
      ],
      transitions: {
        in: { type: 'slide', duration: 520, easing: 'easeOutCubic' },
      },
    },
    null,
    2,
  );

  protected readonly sceneExample = JSON.stringify(
    {
      id: 'intro',
      name: 'Intro',
      start: 0,
      duration: 4200,
      layerIds: ['background', 'headline', 'metric'],
      transitionIn: { type: 'fade', duration: 300, easing: 'easeOutCubic' },
      transitionOut: { type: 'wipe', duration: 420, easing: 'easeInOutCubic' },
    },
    null,
    2,
  );

  protected readonly audioExample = JSON.stringify(
    {
      id: 'voiceover',
      type: 'audio',
      start: 0,
      duration: 4200,
      props: {
        src: './voiceover.mp3',
        volume: 0.8,
        fadeIn: 180,
        fadeOut: 240,
        muted: false,
        solo: false,
      },
    },
    null,
    2,
  );

  protected readonly exportExample = JSON.stringify(
    {
      target: 'mp4',
      size: { width: 1080, height: 1080 },
      fps: 30,
      range: { start: 0, duration: 9000 },
      preset: 'social-square',
      output: './dist/revenue-motion.mp4',
    },
    null,
    2,
  );
}
