import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { MotionStudio } from './motion-studio';

describe('MotionStudio', () => {
  let component: MotionStudio;
  let fixture: ComponentFixture<MotionStudio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotionStudio],
    }).compileComponents();

    fixture = TestBed.createComponent(MotionStudio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not select a layer on initial render', () => {
    fixture.detectChanges();

    expect((component as any).selectedLayerId()).toBeNull();
    expect((component as any).selectedLayerIds()).toEqual([]);
  });

  it('should keep selection empty after clicking outside canvas layers', () => {
    fixture.detectChanges();

    const layer = (component as any).draft().layers[0];
    (component as any).selectLayer(layer);
    (component as any).clearCanvasSelection({
      target: {
        closest: () => null,
      },
    });
    fixture.detectChanges();

    expect((component as any).selectedLayerId()).toBeNull();
    expect((component as any).selectedLayerIds()).toEqual([]);
  });

  it('should finish text editing and clear selection after clicking outside layers', () => {
    fixture.detectChanges();

    const layer = (component as any).draft().layers[0];
    (component as any).selectLayer(layer);
    (component as any).editingTextLayerId.set(layer.id);
    (component as any).clearCanvasSelection({
      target: {
        closest: () => null,
      },
    });
    fixture.detectChanges();

    expect((component as any).editingTextLayerId()).toBeNull();
    expect((component as any).selectedLayerId()).toBeNull();
    expect((component as any).selectedLayerIds()).toEqual([]);
  });

  it('should finish text editing and clear selection after document clicks outside layers', () => {
    fixture.detectChanges();

    const layer = (component as any).draft().layers[0];
    (component as any).selectLayer(layer);
    (component as any).editingTextLayerId.set(layer.id);
    (component as any).handleDocumentPointerdown({
      target: {
        closest: () => null,
      },
    });
    fixture.detectChanges();

    expect((component as any).editingTextLayerId()).toBeNull();
    expect((component as any).selectedLayerId()).toBeNull();
    expect((component as any).selectedLayerIds()).toEqual([]);
  });

  it('should remove a layer transition without leaving an empty transition edge', () => {
    fixture.detectChanges();

    const layer = (component as any).draft().layers[0];
    (component as any).selectLayer(layer);
    (component as any).removeLayerTransition('in');
    fixture.detectChanges();

    const nextLayer = (component as any).draft().layers[0];

    expect(nextLayer.transitions?.in).toBeUndefined();
    expect(nextLayer.transitions?.out).toBeTruthy();
    expect(Object.prototype.hasOwnProperty.call(nextLayer.transitions, 'in')).toBe(false);
  });

  it('should remove the transitions object after deleting the last layer transition', () => {
    fixture.detectChanges();

    const layer = (component as any).draft().layers[1];
    (component as any).selectLayer(layer);
    (component as any).removeLayerTransition('in');
    fixture.detectChanges();

    expect((component as any).draft().layers[1].transitions).toBeUndefined();
  });

  it('should allow removing scene transitions even when the transition type is normalized as none', () => {
    fixture.detectChanges();

    const scene = (component as any).draft().scenes[0];
    scene.transitionIn = {
      type: 'none',
      duration: 500,
    };
    (component as any).selectedSceneId.set(scene.id);

    expect((component as any).sceneTransitionTypeValue(scene, 'in')).toBe('none');
    expect((component as any).hasSceneTransition(scene, 'in')).toBe(true);

    (component as any).removeSceneTransition('in');
    fixture.detectChanges();

    const nextScene = (component as any).draft().scenes[0];

    expect(nextScene.transitionIn).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(nextScene, 'transitionIn')).toBe(false);
  });

  it('should select timeline keyframes without moving the playhead', () => {
    fixture.detectChanges();

    const layer = (component as any).draft().layers[0];
    const animationIndex = 0;
    const keyframeIndex = 1;
    const currentTime = 1234;

    (component as any).seek(currentTime);
    (component as any).selectTimelineKeyframe(layer, animationIndex, keyframeIndex, {
      stopPropagation: vi.fn(),
      type: 'click',
    });
    fixture.detectChanges();

    expect((component as any).selectedKeyframe()).toEqual({
      layerId: layer.id,
      animationIndex,
      keyframeIndex,
    });
    expect((component as any).currentTime()).toBe((component as any).snapTimeToFrame(currentTime));
  });

  it('should preserve layer positions and layout animation keyframes when grouping', () => {
    fixture.detectChanges();

    (component as any).draft.set({
      version: '0.1',
      composition: {
        width: 1000,
        height: 1000,
        fps: 30,
        duration: 2000,
      },
      layers: [
        {
          id: 'animated-x',
          type: 'shape',
          start: 0,
          duration: 1000,
          layout: {
            x: 200,
            y: 100,
            width: 100,
            height: 80,
          },
          animations: [
            {
              property: 'x',
              keyframes: [
                { time: 0, value: 220 },
                { time: 500, value: 260 },
              ],
            },
          ],
        },
        {
          id: 'animated-y',
          type: 'shape',
          start: 0,
          duration: 1000,
          layout: {
            x: 500,
            y: 300,
            width: 60,
            height: 60,
          },
          animations: [
            {
              property: 'y',
              keyframes: [
                { time: 0, value: 330 },
                { time: 500, value: 360 },
              ],
            },
          ],
        },
      ],
    });
    (component as any).selectedLayerId.set('animated-x');
    (component as any).selectedLayerIds.set(['animated-x', 'animated-y']);

    (component as any).groupSelectedLayers();
    fixture.detectChanges();

    const group = (component as any).draft().layers.find((layer: any) => layer.type === 'group');
    const [animatedX, animatedY] = group.children;

    expect(group.layout).toEqual({ x: 200, y: 100, width: 360, height: 260 });
    expect(animatedX.layout.x).toBe(0);
    expect(animatedX.layout.y).toBe(0);
    expect(animatedX.animations[0].keyframes.map((keyframe: any) => keyframe.value)).toEqual([
      20,
      60,
    ]);
    expect(animatedY.layout.x).toBe(300);
    expect(animatedY.layout.y).toBe(200);
    expect(animatedY.animations[0].keyframes.map((keyframe: any) => keyframe.value)).toEqual([
      230,
      260,
    ]);
  });
});
