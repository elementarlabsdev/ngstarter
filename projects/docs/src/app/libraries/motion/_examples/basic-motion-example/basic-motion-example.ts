import { Component, signal } from '@angular/core';
import { MotionDocument, MotionStudio } from '@ngstarter-ui/components/motion';

@Component({
  selector: 'app-basic-motion-example',
  imports: [MotionStudio],
  templateUrl: './basic-motion-example.html',
  styleUrl: './basic-motion-example.scss',
})
export class BasicMotionExample {
  readonly document = signal<MotionDocument>({
    version: '0.1',
    composition: {
      width: 1920,
      height: 1080,
      fps: 30,
      duration: 7200,
      background: '#0f172a',
    },
    assets: [],
    layers: [
      {
        id: 'headline',
        type: 'text',
        name: 'Headline',
        start: 0,
        duration: 5200,
        zIndex: 3,
        layout: {
          x: 144,
          y: 152,
          width: 1040,
          height: 210,
        },
        style: {
          color: '#ffffff',
          fontSize: 94,
          fontWeight: 700,
          lineHeight: 1.05,
        },
        props: {
          text: 'Revenue motion deck',
        },
        transitions: {
          in: {
            type: 'slide',
            duration: 650,
            easing: 'easeOutCubic',
            props: { direction: 'left', distance: 160 },
          },
          out: {
            type: 'fade',
            duration: 520,
            easing: 'easeInOutCubic',
          },
        },
        animations: [
          {
            property: 'opacity',
            keyframes: [
              { time: 0, value: 0 },
              { time: 520, value: 1, easing: 'easeOutCubic' },
              { time: 4600, value: 1 },
              { time: 5200, value: 0, easing: 'easeInCubic' },
            ],
          },
          {
            property: 'y',
            keyframes: [
              { time: 0, value: 212 },
              { time: 520, value: 152, easing: 'easeOutCubic' },
            ],
          },
        ],
      },
      {
        id: 'caption',
        type: 'text',
        name: 'Caption',
        start: 420,
        duration: 4200,
        zIndex: 4,
        layout: {
          x: 150,
          y: 386,
          width: 820,
          height: 88,
        },
        style: {
          color: '#bfdbfe',
          fontSize: 34,
          fontWeight: 500,
          lineHeight: 1.3,
        },
        props: {
          text: 'Layered text, shapes, timing, and keyframes are stored as JSON.',
        },
        transitions: {
          in: {
            type: 'fade',
            duration: 460,
            easing: 'easeOutCubic',
          },
        },
        animations: [
          {
            property: 'opacity',
            keyframes: [
              { time: 0, value: 0 },
              { time: 460, value: 1, easing: 'easeOutCubic' },
            ],
          },
        ],
      },
      {
        id: 'panel',
        type: 'shape',
        name: 'Metric panel',
        start: 800,
        duration: 5000,
        zIndex: 1,
        layout: {
          x: 1220,
          y: 170,
          width: 520,
          height: 520,
        },
        style: {
          background: '#1d4ed8',
          borderRadius: 48,
        },
        props: {
          kind: 'rectangle',
        },
        transitions: {
          in: {
            type: 'scale',
            duration: 700,
            easing: 'easeOutCubic',
          },
          out: {
            type: 'blur',
            duration: 520,
            easing: 'easeInOutCubic',
          },
        },
        animations: [
          {
            property: 'opacity',
            keyframes: [
              { time: 0, value: 0 },
              { time: 700, value: 0.9, easing: 'easeOutCubic' },
            ],
          },
          {
            property: 'scale',
            keyframes: [
              { time: 0, value: 0.88 },
              { time: 700, value: 1, easing: 'easeOutCubic' },
            ],
          },
        ],
      },
      {
        id: 'metric',
        type: 'text',
        name: 'Metric',
        start: 1150,
        duration: 4300,
        zIndex: 5,
        layout: {
          x: 1308,
          y: 304,
          width: 340,
          height: 150,
        },
        style: {
          color: '#ffffff',
          fontSize: 112,
          fontWeight: 700,
          lineHeight: 1,
          textAlign: 'center',
        },
        props: {
          text: '+42%',
        },
        transitions: {
          in: {
            type: 'wipe',
            duration: 560,
            easing: 'easeOutCubic',
            props: { direction: 'left' },
          },
        },
        animations: [
          {
            property: 'opacity',
            keyframes: [
              { time: 0, value: 0 },
              { time: 500, value: 1, easing: 'easeOutCubic' },
            ],
          },
          {
            property: 'text',
            easing: 'easeOutCubic',
            keyframes: [
              { time: 0, value: '+0%' },
              { time: 900, value: '+42%', easing: 'easeOutCubic' },
            ],
          },
        ],
      },
    ],
    scenes: [
      {
        id: 'scene-intro',
        name: 'Intro',
        start: 0,
        duration: 3600,
        layerIds: ['headline', 'caption'],
        transitionIn: {
          type: 'fade',
          duration: 520,
          easing: 'easeOutCubic',
        },
        transitionOut: {
          type: 'wipe',
          duration: 620,
          easing: 'easeInOutCubic',
          props: { direction: 'right', distance: 140 },
        },
      },
      {
        id: 'scene-metrics',
        name: 'Metrics',
        start: 800,
        duration: 5600,
        layerIds: ['panel', 'metric'],
        transitionIn: {
          type: 'slide',
          duration: 620,
          easing: 'easeOutCubic',
          props: { direction: 'up', distance: 120 },
        },
        transitionOut: {
          type: 'fade',
          duration: 520,
          easing: 'easeInOutCubic',
        },
      },
    ],
  });
}
