import { describe, expect, it } from 'vitest';

import {
  interpolateMotionValue,
  resolveMotionAnimation,
  resolveMotionLayerSnapshot,
} from './motion-engine';
import { MotionLayer } from '../schema/motion-document';

describe('motion engine', () => {
  it('interpolates hex colors', () => {
    expect(interpolateMotionValue('#000000', '#ffffff', 0.5)).toBe('rgb(128, 128, 128)');
  });

  it('resolves delayed alternating animation repeats', () => {
    expect(
      resolveMotionAnimation(
        {
          property: 'x',
          delay: 100,
          repeat: 3,
          direction: 'alternate',
          keyframes: [
            { time: 0, value: 0 },
            { time: 100, value: 100 },
          ],
        },
        250,
      ),
    ).toBe(50);
  });

  it('includes independent scale and skew values in layer transforms', () => {
    const layer: MotionLayer = {
      id: 'shape',
      type: 'shape',
      start: 0,
      duration: 1000,
      layout: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        scale: 2,
        scaleX: 1.5,
        scaleY: 0.5,
        skewX: 8,
        skewY: -4,
      },
    };

    expect(resolveMotionLayerSnapshot(layer, 0).transform).toContain(
      'skew(8deg, -4deg) scale(3, 1)',
    );
  });

  it('resolves text effects from animation tracks only while the track is active', () => {
    const layer: MotionLayer = {
      id: 'text',
      type: 'text',
      start: 0,
      duration: 2000,
      layout: {
        x: 0,
        y: 0,
        width: 400,
        height: 120,
      },
      props: {
        text: 'Hello',
      },
      animations: [
        {
          property: 'textEffect',
          keyframes: [
            {
              time: 500,
              value: {
                type: 'chars-slide-up',
                duration: 600,
                delay: 0,
                stagger: 20,
                distance: 24,
                ease: 'power3.out',
              },
            },
            {
              time: 1100,
              value: null,
            },
          ],
        },
      ],
    };

    expect(resolveMotionLayerSnapshot(layer, 400).props['textEffect']).toBeUndefined();
    expect(resolveMotionLayerSnapshot(layer, 500).props['textEffect']).toEqual(
      expect.objectContaining({
        type: 'chars-slide-up',
        startTime: 500,
      }),
    );
    expect(resolveMotionLayerSnapshot(layer, 1100).props['textEffect']).toBeUndefined();
  });
});
