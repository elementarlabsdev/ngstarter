import { Component, computed } from '@angular/core';
import { Card, CardContent, CardHeader, CardTitle } from '@ngstarter-ui/components/card';
import { Chip, ChipSet } from '@ngstarter-ui/components/chips';
import {
  createMotionRenderManifest,
  MotionDocument,
  MotionRenderer,
  renderMotion,
  validateMotionExport,
} from '@ngstarter-ui/components/motion';

@Component({
  selector: 'app-render-export-example',
  imports: [Card, CardContent, CardHeader, CardTitle, Chip, ChipSet, MotionRenderer],
  templateUrl: './render-export-example.html',
  styleUrl: './render-export-example.scss',
})
export class RenderExportExample {
  protected readonly document: MotionDocument = {
    version: '0.1',
    composition: {
      width: 1280,
      height: 720,
      fps: 30,
      duration: 4200,
      background: '#0f172a',
    },
    assets: [],
    layers: [
      {
        id: 'background-panel',
        type: 'shape',
        name: 'Background panel',
        start: 0,
        duration: 4200,
        zIndex: 1,
        layout: {
          x: 104,
          y: 112,
          width: 1072,
          height: 496,
        },
        style: {
          background: '#2563eb',
          borderRadius: 42,
          opacity: 0.9,
        },
        props: {
          kind: 'rectangle',
        },
      },
      {
        id: 'headline',
        type: 'text',
        name: 'Headline',
        start: 0,
        duration: 2600,
        zIndex: 2,
        layout: {
          x: 156,
          y: 180,
          width: 700,
          height: 140,
        },
        style: {
          color: '#ffffff',
          fontSize: 72,
          fontWeight: 700,
          lineHeight: 1.08,
        },
        props: {
          text: 'Frame renderer',
        },
      },
      {
        id: 'caption',
        type: 'text',
        name: 'Caption',
        start: 400,
        duration: 2800,
        zIndex: 3,
        layout: {
          x: 160,
          y: 330,
          width: 560,
          height: 84,
        },
        style: {
          color: '#dbeafe',
          fontSize: 28,
          fontWeight: 500,
          lineHeight: 1.32,
        },
        props: {
          text: 'Render any frame from the same JSON document used by Motion Studio.',
        },
      },
      {
        id: 'metric',
        type: 'text',
        name: 'Metric',
        start: 900,
        duration: 2600,
        zIndex: 4,
        layout: {
          x: 810,
          y: 260,
          width: 260,
          height: 132,
        },
        style: {
          color: '#ffffff',
          fontSize: 96,
          fontWeight: 700,
          lineHeight: 1,
          textAlign: 'center',
        },
        props: {
          text: '+42%',
        },
      },
    ],
    scenes: [
      {
        id: 'scene-render',
        name: 'Render',
        start: 0,
        duration: 4200,
        layerIds: ['background-panel', 'headline', 'caption', 'metric'],
        transitionIn: {
          type: 'fade',
          duration: 300,
          easing: 'easeOutCubic',
        },
        transitionOut: {
          type: 'fade',
          duration: 360,
          easing: 'easeInOutCubic',
        },
      },
    ],
  };

  protected readonly manifest = computed(() => createMotionRenderManifest(this.document));
  protected readonly renderPlan = computed(() =>
    renderMotion(this.document, {
      frameStep: 30,
      output: 'frames',
      format: 'png',
    }),
  );
  protected readonly exportIssues = computed(() => validateMotionExport(this.document));
  protected readonly manifestJson = computed(() => JSON.stringify(this.manifest(), null, 2));
  protected readonly renderTime = 1500;
  protected readonly runnerCode = `import { provideMotionRenderMockRunner } from '@ngstarter-ui/components/motion';

export const appConfig = {
  providers: [
    provideMotionRenderMockRunner({ frameDelay: 8, encodeDelay: 260 }),
  ],
};`;
  protected readonly audioLayerJson = JSON.stringify(
    {
      id: 'voiceover',
      type: 'audio',
      name: 'Voiceover',
      start: 0,
      duration: 4200,
      props: {
        src: './voiceover.mp3',
        volume: 0.85,
        fadeIn: 180,
        fadeOut: 220,
      },
    },
    null,
    2,
  );
}
