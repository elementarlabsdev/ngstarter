import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { MotionStudio } from './motion-studio';
import { resolveMotionLayerSnapshot } from '../engine/motion-engine';
import { MOTION_PRESETS } from '../presets/motion-presets';

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

  it('should create an initial scene when adding the first layer without scenes', () => {
    fixture.detectChanges();

    (component as any).draft.set({
      version: '0.1',
      composition: {
        width: 1920,
        height: 1080,
        fps: 30,
        duration: 5 * 60 * 1000,
      },
      layers: [],
      tracks: [],
      scenes: [],
    });

    (component as any).addTextLayer();
    fixture.detectChanges();

    const document = (component as any).draft();
    const layer = document.layers[0];
    const scene = document.scenes[0];

    expect(document.scenes).toHaveLength(1);
    expect(scene.name).toBe('Scene 1');
    expect(scene.layerIds).toEqual([layer.id]);
    expect((component as any).selectedSceneId()).toBe(scene.id);
    expect((component as any).selectedLayerId()).toBe(layer.id);
  });

  it('should default the timeline duration to five minutes', () => {
    fixture.detectChanges();

    expect((component as any).duration()).toBe(5 * 60 * 1000);
  });

  it('should render timeline tick labels as minutes and seconds only', () => {
    fixture.detectChanges();

    const label = (component as any).formatTimelineTime(3220);

    expect(label).toBe('0:03');
    expect(label).not.toContain('.');
  });

  it('should clamp stored timeline zoom to a minimum of 8x', () => {
    fixture.detectChanges();

    (component as any).syncEditorSettings({ zoom: 1 });

    expect((component as any).timelineZoomMode()).toBe('8');
    expect((component as any).timelineZoomScale()).toBe(8);
  });

  it('should zoom the timeline only with command wheel and not below 8x', () => {
    fixture.detectChanges();

    const preventDefault = vi.fn();

    (component as any).handleTimelineWheel({
      metaKey: true,
      ctrlKey: false,
      deltaY: -1,
      preventDefault,
    });

    expect(preventDefault).toHaveBeenCalled();
    expect((component as any).timelineZoomMode()).toBe('16');

    (component as any).handleTimelineWheel({
      metaKey: true,
      ctrlKey: false,
      deltaY: 1,
      preventDefault,
    });
    (component as any).handleTimelineWheel({
      metaKey: true,
      ctrlKey: false,
      deltaY: 1,
      preventDefault,
    });

    expect((component as any).timelineZoomMode()).toBe('8');
  });

  it('should ignore double clicks on canvas text layers', () => {
    fixture.detectChanges();

    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();

    (component as any).ignoreCanvasLayerDoubleClick({
      preventDefault,
      stopPropagation,
    });
    fixture.detectChanges();

    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
    expect((component as any).editingTextLayerId()).toBeNull();
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

  it('should not change canvas selection from a right click on the canvas background', () => {
    fixture.detectChanges();

    const layer = (component as any).draft().layers[0];
    (component as any).selectLayer(layer);
    (component as any).startCanvasBoxSelect({
      button: 2,
      target: {
        closest: () => null,
      },
    });
    (component as any).clearCanvasSelection({
      button: 2,
      target: {
        closest: () => null,
      },
    });
    fixture.detectChanges();

    expect((component as any).selectedLayerId()).toBe(layer.id);
    expect((component as any).selectedLayerIds()).toEqual([layer.id]);
    expect((component as any).canvasInteractionType()).toBeNull();
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

  it('should update text layer line height', () => {
    fixture.detectChanges();

    const layer = (component as any).draft().layers.find((item: any) => item.type === 'text');
    (component as any).selectLayer(layer);

    (component as any).setLayerLineHeight(1.35);
    fixture.detectChanges();

    expect((component as any).draft().layers.find((item: any) => item.id === layer.id).style.lineHeight).toBe(
      1.35,
    );
  });

  it('should update animated line width when editing transform width', () => {
    fixture.detectChanges();

    const layer = (component as any).draft().layers.find((item: any) => item.id === 'accent');
    (component as any).selectLayer(layer);

    (component as any).setLayerLayoutNumber('width', 700);
    fixture.detectChanges();

    const nextLayer = (component as any).draft().layers.find((item: any) => item.id === layer.id);
    const widthAnimation = nextLayer.animations.find(
      (animation: any) => animation.property === 'width',
    );
    const snapshot = resolveMotionLayerSnapshot(nextLayer, nextLayer.start + 700);

    expect(nextLayer.layout.width).toBe(700);
    expect(widthAnimation.keyframes.map((keyframe: any) => keyframe.value)).toEqual([0, 700]);
    expect(snapshot.layout.width).toBe(700);
  });

  it('should create line presets without rounded corners', () => {
    const lineLayer = MOTION_PRESETS.find((preset) => preset.id === 'shape-line')?.layers[0];

    expect(lineLayer?.props?.['kind']).toBe('line');
    expect(lineLayer?.style?.borderRadius).toBe(0);
  });

  it('should expose only horizontal resize handles for line layers', () => {
    fixture.detectChanges();

    expect(
      (component as any).canvasResizeHandles({
        type: 'shape',
        props: { kind: 'line' },
      }),
    ).toEqual(['w', 'e']);
    expect(
      (component as any).canvasResizeHandles({
        type: 'group',
        children: [
          {
            type: 'shape',
            props: { kind: 'line' },
          },
        ],
      }),
    ).toEqual(['w', 'e']);
    expect(
      (component as any).canvasResizeHandles({
        type: 'shape',
        props: { kind: 'rectangle' },
      }),
    ).toEqual(['nw', 'ne', 'e', 'se', 's', 'sw', 'w', 'n']);
  });

  it('should insert presets as a single selected group layer', () => {
    fixture.detectChanges();

    (component as any).draft.set({
      version: '0.1',
      composition: {
        width: 1920,
        height: 1080,
        fps: 30,
        duration: 5 * 60 * 1000,
      },
      layers: [],
      tracks: [],
      scenes: [],
    });

    const preset = MOTION_PRESETS.find((item) => item.id === 'product-card')!;

    (component as any).applyPreset(preset);
    fixture.detectChanges();

    const document = (component as any).draft();
    const group = document.layers[0];
    const childIds = group.children.map((layer: any) => layer.id);

    expect(document.layers).toHaveLength(1);
    expect(group.type).toBe('group');
    expect(group.name).toBe(preset.name);
    expect(group.children).toHaveLength(preset.layers.length);
    expect(Math.min(...group.children.map((layer: any) => layer.layout.x))).toBe(0);
    expect(Math.min(...group.children.map((layer: any) => layer.layout.y))).toBe(0);
    expect(document.tracks[0].layerIds).toEqual([group.id]);
    expect(document.scenes[0].layerIds).toEqual([group.id]);
    expect(document.tracks[0].layerIds.some((layerId: string) => childIds.includes(layerId))).toBe(
      false,
    );
    expect((component as any).selectedLayerId()).toBe(group.id);
    expect((component as any).selectedLayerIds()).toEqual([group.id]);
  });

  it('should resize preset group children proportionally', () => {
    fixture.detectChanges();

    (component as any).draft.set({
      version: '0.1',
      composition: {
        width: 1920,
        height: 1080,
        fps: 30,
        duration: 5 * 60 * 1000,
      },
      layers: [],
      tracks: [],
      scenes: [],
    });

    const preset = MOTION_PRESETS.find((item) => item.id === 'shape-line')!;

    (component as any).applyPreset(preset);
    fixture.detectChanges();

    const group = (component as any).draft().layers[0];
    const startWidth = group.layout.width;
    const childStartWidth = group.children[0].layout.width;

    (component as any).selectLayer(group);
    (component as any).setLayerLayoutNumber('width', startWidth * 2);
    fixture.detectChanges();

    const nextGroup = (component as any).draft().layers[0];

    expect(nextGroup.layout.width).toBe(startWidth * 2);
    expect(nextGroup.children[0].layout.width).toBe(childStartWidth * 2);
    expect((component as any).canvasResizeHandles(nextGroup)).toEqual(['w', 'e']);
  });

  it('should scale slide effect distances when resizing a layer', () => {
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
          id: 'slide-layer',
          type: 'shape',
          start: 0,
          duration: 1000,
          layout: {
            x: 100,
            y: 100,
            width: 200,
            height: 100,
          },
          props: {
            kind: 'rectangle',
          },
          animations: [
            {
              property: 'x',
              keyframes: [
                { time: 0, value: 50 },
                { time: 500, value: 100 },
              ],
            },
          ],
          transitions: {
            in: {
              type: 'slide',
              duration: 400,
              props: { direction: 'left', distance: 50 },
            },
          },
        },
      ],
    });
    (component as any).selectedLayerId.set('slide-layer');
    (component as any).selectedLayerIds.set(['slide-layer']);

    (component as any).setLayerLayoutNumber('width', 400);
    fixture.detectChanges();

    const layer = (component as any).draft().layers[0];

    expect(layer.animations[0].keyframes.map((keyframe: any) => keyframe.value)).toEqual([
      0,
      100,
    ]);
    expect(layer.transitions.in.props.distance).toBe(100);
  });

  it('should scale text effect distances when resizing text layer height', () => {
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
          id: 'text-effect-layer',
          type: 'text',
          start: 0,
          duration: 1000,
          layout: {
            x: 100,
            y: 100,
            width: 300,
            height: 100,
          },
          props: {
            text: 'Resize me',
          },
          animations: [
            {
              property: 'textEffect',
              keyframes: [
                {
                  time: 0,
                  value: {
                    type: 'chars-slide-up',
                    duration: 400,
                    stagger: 20,
                    distance: 30,
                  },
                },
                { time: 600, value: null },
              ],
            },
          ],
        },
      ],
    });
    (component as any).selectedLayerId.set('text-effect-layer');
    (component as any).selectedLayerIds.set(['text-effect-layer']);

    (component as any).setLayerLayoutNumber('height', 200);
    fixture.detectChanges();

    const layer = (component as any).draft().layers[0];

    expect(layer.animations[0].keyframes[0].value.distance).toBe(60);
  });

  it('should create text layers with 1.35 line height by default', () => {
    fixture.detectChanges();

    (component as any).draft.set({
      version: '0.1',
      composition: {
        width: 1920,
        height: 1080,
        fps: 30,
        duration: 5 * 60 * 1000,
      },
      layers: [],
      tracks: [],
      scenes: [],
    });

    (component as any).addTextLayer();
    fixture.detectChanges();

    const layer = (component as any).draft().layers.find((item: any) => item.type === 'text');

    expect(layer.style.lineHeight).toBe(1.35);
  });

  it('should add text effects as timeline animation tracks', () => {
    fixture.detectChanges();

    const layer = (component as any).draft().layers.find((item: any) => item.type === 'text');
    (component as any).selectLayer(layer);

    (component as any).applyTextEffectPreset('split-text-masked-letters');
    fixture.detectChanges();

    const nextLayer = (component as any).draft().layers.find((item: any) => item.id === layer.id);
    const textEffectTrack = nextLayer.animations.find(
      (animation: any) => animation.property === 'textEffect',
    );

    expect(nextLayer.props?.textEffect).toBeUndefined();
    expect(textEffectTrack).toBeTruthy();
    expect(textEffectTrack.keyframes[0].value.type).toBe('split-text-masked-letters');
    expect(textEffectTrack.keyframes[textEffectTrack.keyframes.length - 1].value).toBeNull();
    expect((component as any).selectedTextEffectType(nextLayer)).toBe('split-text-masked-letters');
    expect((component as any).isLayerAnimationExpanded(nextLayer)).toBe(true);
  });

  it('should keep words fade up active until every word has animated', () => {
    fixture.detectChanges();

    const layer = (component as any).draft().layers.find((item: any) => item.type === 'text');
    (component as any).selectLayer(layer);
    (component as any).setLayerText(
      'A premium, AI optimized Angular component library with high-performance UI components, admin dashboard templates',
    );
    (component as any).applyTextEffectPreset('words-fade-up');
    fixture.detectChanges();

    const nextLayer = (component as any).draft().layers.find((item: any) => item.id === layer.id);
    const textEffectTrack = nextLayer.animations.find(
      (animation: any) => animation.property === 'textEffect',
    );

    expect(textEffectTrack.keyframes[1].time - textEffectTrack.keyframes[0].time).toBe(1470);
  });

  it('should keep text effect config valid when resizing the effect track', () => {
    fixture.detectChanges();

    const layer = (component as any).draft().layers.find((item: any) => item.type === 'text');
    (component as any).selectLayer(layer);
    (component as any).applyTextEffectPreset('split-text-masked-letters');

    let nextLayer = (component as any).draft().layers.find((item: any) => item.id === layer.id);
    const animationIndex = nextLayer.animations.findIndex(
      (animation: any) => animation.property === 'textEffect',
    );

    (component as any).selectTimelineAnimationTrack(nextLayer, animationIndex);
    (component as any).setSelectedAnimationTrackDuration(1200);
    fixture.detectChanges();

    nextLayer = (component as any).draft().layers.find((item: any) => item.id === layer.id);
    const textEffectTrack = nextLayer.animations[animationIndex];

    expect(textEffectTrack.keyframes).toHaveLength(2);
    expect(textEffectTrack.keyframes[0].value).toEqual(
      expect.objectContaining({
        type: 'split-text-masked-letters',
        duration: 1200,
        stagger: 1200,
      }),
    );
    expect(textEffectTrack.keyframes[1].time - textEffectTrack.keyframes[0].time).toBe(1200);
    expect(textEffectTrack.keyframes[1].value).toBeNull();
  });

  it('should preserve PrepareText words SplitText flags when resizing the effect track', () => {
    fixture.detectChanges();

    const layer = (component as any).draft().layers.find((item: any) => item.type === 'text');
    (component as any).selectLayer(layer);
    (component as any).applyTextEffectPreset('prepare-text-words');

    let nextLayer = (component as any).draft().layers.find((item: any) => item.id === layer.id);
    const animationIndex = nextLayer.animations.findIndex(
      (animation: any) => animation.property === 'textEffect',
    );

    (component as any).selectTimelineAnimationTrack(nextLayer, animationIndex);
    (component as any).setSelectedAnimationTrackDuration(1400);
    fixture.detectChanges();

    nextLayer = (component as any).draft().layers.find((item: any) => item.id === layer.id);
    const textEffectTrack = nextLayer.animations[animationIndex];

    expect(textEffectTrack.keyframes[0].value).toEqual(
      expect.objectContaining({
        type: 'prepare-text-words',
        duration: 1400,
        stagger: 233.33,
        prepareText: true,
        useSplitText: true,
      }),
    );
    expect(textEffectTrack.keyframes[1].time - textEffectTrack.keyframes[0].time).toBe(1400);
    expect(textEffectTrack.keyframes[1].value).toBeNull();
  });

  it('should show concrete effect names for timeline animation tracks', () => {
    fixture.detectChanges();

    const layer = (component as any).draft().layers.find((item: any) => item.type === 'text');
    (component as any).selectLayer(layer);

    const fadeInTile = (component as any)
      .effectTiles()
      .find((tile: any) => tile.id === 'fade-in');
    const fadeTile = (component as any).effectTiles().find((tile: any) => tile.id === 'fade');

    expect(fadeTile).toBeUndefined();

    (component as any).addEffectTrack(fadeInTile);
    (component as any).applyTextEffectPreset('prepare-text-words');
    fixture.detectChanges();

    const nextLayer = (component as any).draft().layers.find((item: any) => item.id === layer.id);
    const labels = nextLayer.animations.map((animation: any) =>
      (component as any).animationTrackLabel(animation),
    );

    expect(labels).toContain('Fade in');
    expect(labels).toContain('PrepareText words');
    expect(labels).not.toContain('Fade');
    expect(labels).not.toContain('Text effect');
  });

  it('should make fade out start visibly from the beginning of its timeline track', () => {
    fixture.detectChanges();

    const layer = (component as any).draft().layers.find((item: any) => item.type === 'text');
    (component as any).selectLayer(layer);

    const fadeOutTile = (component as any)
      .effectTiles()
      .find((tile: any) => tile.id === 'fade-out');

    (component as any).addEffectTrack(fadeOutTile);
    fixture.detectChanges();

    const nextLayer = (component as any).draft().layers.find((item: any) => item.id === layer.id);
    const fadeOut = nextLayer.animations.find((animation: any) =>
      animation.id.startsWith('fade-out'),
    );

    expect(fadeOut.easing).toBe('easeOutCubic');
    expect(fadeOut.keyframes[1].easing).toBe('easeOutCubic');
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

  it('should move scene layers with the scene timeline clip', () => {
    fixture.detectChanges();

    (component as any).draft.set({
      version: '0.1',
      composition: {
        width: 1000,
        height: 1000,
        fps: 30,
        duration: 10000,
      },
      layers: [
        {
          id: 'scene-layer-a',
          type: 'shape',
          start: 1100,
          duration: 500,
          layout: {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          },
        },
        {
          id: 'scene-layer-b',
          type: 'text',
          start: 1800,
          duration: 700,
          layout: {
            x: 100,
            y: 100,
            width: 200,
            height: 80,
          },
          props: {
            text: 'Scene child',
          },
        },
        {
          id: 'outside-layer',
          type: 'shape',
          start: 500,
          duration: 400,
          layout: {
            x: 300,
            y: 300,
            width: 100,
            height: 100,
          },
        },
      ],
      scenes: [
        {
          id: 'scene-a',
          name: 'Scene A',
          start: 1000,
          duration: 3000,
          layerIds: ['scene-layer-a', 'scene-layer-b'],
        },
      ],
    });

    const scene = (component as any).draft().scenes[0];
    const sceneGroup = (component as any).createSceneTimelineDragEntries(scene);
    const sceneLayerGroup = (component as any).createSceneTimelineLayerDragEntries(sceneGroup);

    (component as any).continueSceneTimelineInteraction(
      {
        type: 'scene-timeline',
        sceneId: 'scene-a',
        mode: 'move',
        startClientX: 0,
        start: 1000,
        duration: 3000,
        sceneGroup,
        sceneLayerGroup,
        timelineRect: { width: 1176 },
      },
      { clientX: 100 },
    );
    fixture.detectChanges();

    const next = (component as any).draft();

    expect(next.scenes[0].start).toBe(2100);
    expect(next.scenes[0].duration).toBe(1400);
    expect(next.layers.find((layer: any) => layer.id === 'scene-layer-a').start).toBe(2100);
    expect(next.layers.find((layer: any) => layer.id === 'scene-layer-b').start).toBe(2800);
    expect(next.layers.find((layer: any) => layer.id === 'outside-layer').start).toBe(500);
  });

  it('should not move the playhead when starting a scene timeline drag', () => {
    fixture.detectChanges();

    (component as any).draft.set({
      version: '0.1',
      composition: {
        width: 1000,
        height: 1000,
        fps: 30,
        duration: 10000,
      },
      layers: [],
      scenes: [
        {
          id: 'scene-a',
          name: 'Scene A',
          start: 2000,
          duration: 2000,
          layerIds: [],
        },
      ],
    });
    (component as any).seek(1234);

    const timeline = {
      getBoundingClientRect: () => ({ width: 1176 }),
    };
    const event = {
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
      shiftKey: false,
      metaKey: false,
      ctrlKey: false,
      clientX: 0,
      currentTarget: {
        closest: () => timeline,
      },
    };

    (component as any).startSceneTimelineMove((component as any).draft().scenes[0], event);

    expect((component as any).currentTime()).toBe((component as any).snapTimeToFrame(1234));

    (component as any).endInteraction();
  });

  it('should move selected timeline scenes as a group', () => {
    fixture.detectChanges();

    (component as any).draft.set({
      version: '0.1',
      composition: {
        width: 1000,
        height: 1000,
        fps: 30,
        duration: 10000,
      },
      layers: [
        {
          id: 'scene-layer-a',
          type: 'shape',
          start: 1100,
          duration: 500,
          layout: {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          },
        },
        {
          id: 'scene-layer-b',
          type: 'shape',
          start: 3600,
          duration: 500,
          layout: {
            x: 120,
            y: 0,
            width: 100,
            height: 100,
          },
        },
        {
          id: 'outside-layer',
          type: 'shape',
          start: 7200,
          duration: 500,
          layout: {
            x: 240,
            y: 0,
            width: 100,
            height: 100,
          },
        },
      ],
      scenes: [
        {
          id: 'scene-a',
          name: 'Scene A',
          start: 1000,
          duration: 2000,
          layerIds: ['scene-layer-a'],
        },
        {
          id: 'scene-b',
          name: 'Scene B',
          start: 3500,
          duration: 2000,
          layerIds: ['scene-layer-b'],
        },
        {
          id: 'scene-c',
          name: 'Scene C',
          start: 7000,
          duration: 1000,
          layerIds: ['outside-layer'],
        },
      ],
    });
    (component as any).setSelectedScenes(['scene-a', 'scene-b'], 'scene-a');

    const scene = (component as any).draft().scenes[0];
    const sceneGroup = (component as any).createSceneTimelineDragEntries(scene);
    const sceneLayerGroup = (component as any).createSceneTimelineLayerDragEntries(sceneGroup);

    (component as any).continueSceneTimelineInteraction(
      {
        type: 'scene-timeline',
        sceneId: 'scene-a',
        mode: 'move',
        startClientX: 0,
        start: 1000,
        duration: 2000,
        sceneGroup,
        sceneLayerGroup,
        timelineRect: { width: 1176 },
      },
      { clientX: 100 },
    );
    fixture.detectChanges();

    const next = (component as any).draft();

    expect(next.scenes.find((scene: any) => scene.id === 'scene-a').start).toBe(2100);
    expect(next.scenes.find((scene: any) => scene.id === 'scene-a').duration).toBe(500);
    expect(next.scenes.find((scene: any) => scene.id === 'scene-b').start).toBe(4600);
    expect(next.scenes.find((scene: any) => scene.id === 'scene-b').duration).toBe(500);
    expect(next.scenes.find((scene: any) => scene.id === 'scene-c').start).toBe(7200);
    expect(next.scenes.find((scene: any) => scene.id === 'scene-c').duration).toBe(500);
    expect(next.layers.find((layer: any) => layer.id === 'scene-layer-a').start).toBe(2100);
    expect(next.layers.find((layer: any) => layer.id === 'scene-layer-b').start).toBe(4600);
    expect(next.layers.find((layer: any) => layer.id === 'outside-layer').start).toBe(7200);
  });

  it('should sync scene bounds from its layers after layer timing changes', () => {
    fixture.detectChanges();

    (component as any).draft.set({
      version: '0.1',
      composition: {
        width: 1000,
        height: 1000,
        fps: 30,
        duration: 10000,
      },
      layers: [
        {
          id: 'scene-layer-a',
          type: 'shape',
          start: 1000,
          duration: 1000,
          layout: {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          },
        },
        {
          id: 'scene-layer-b',
          type: 'shape',
          start: 2500,
          duration: 500,
          layout: {
            x: 120,
            y: 0,
            width: 100,
            height: 100,
          },
        },
      ],
      scenes: [
        {
          id: 'scene-a',
          name: 'Scene A',
          start: 0,
          duration: 5000,
          layerIds: ['scene-layer-a', 'scene-layer-b'],
        },
      ],
    });

    (component as any).updateLayer('scene-layer-a', (layer: any) => {
      layer.start = 1500;
      layer.duration = 250;
    });
    fixture.detectChanges();

    const scene = (component as any).draft().scenes[0];

    expect(scene.start).toBe(1500);
    expect(scene.duration).toBe(1500);
  });

  it('should find scene clips inside a timeline selection box', () => {
    fixture.detectChanges();

    const timeline = document.createElement('div');
    const sceneA = document.createElement('button');
    const sceneB = document.createElement('button');

    timeline.getBoundingClientRect = () =>
      ({ left: 0, top: 0, right: 1000, bottom: 200, width: 1000, height: 200 }) as DOMRect;
    sceneA.className = 'ngs-motion-studio__scene-clip';
    sceneA.dataset['motionSceneId'] = 'scene-a';
    sceneA.getBoundingClientRect = () =>
      ({ left: 220, top: 40, right: 340, bottom: 70, width: 120, height: 30 }) as DOMRect;
    sceneB.className = 'ngs-motion-studio__scene-clip';
    sceneB.dataset['motionSceneId'] = 'scene-b';
    sceneB.getBoundingClientRect = () =>
      ({ left: 500, top: 40, right: 620, bottom: 70, width: 120, height: 30 }) as DOMRect;

    timeline.append(sceneA, sceneB);

    expect(
      (component as any).findScenesInTimelineSelectionBox(timeline, {
        left: 200,
        top: 30,
        width: 180,
        height: 60,
      }),
    ).toEqual(['scene-a']);
  });

  it('should select multiple scenes from timeline box selection', () => {
    fixture.detectChanges();

    (component as any).selectedLayerId.set('layer-a');
    (component as any).selectedLayerIds.set(['layer-a']);
    (component as any).setSelectedKeyframeRefs([
      {
        layerId: 'layer-a',
        animationIndex: 0,
        keyframeIndex: 0,
      },
    ]);

    (component as any).applyTimelineBoxSelection([], ['scene-a', 'scene-b']);

    expect((component as any).selectedSceneIds()).toEqual(['scene-a', 'scene-b']);
    expect((component as any).selectedSceneId()).toBe('scene-b');
    expect((component as any).selectedLayerId()).toBeNull();
    expect((component as any).selectedLayerIds()).toEqual([]);
    expect((component as any).selectedKeyframes()).toEqual([]);
  });

  it('should keep timeline scene rows in document order while scene times change', () => {
    fixture.detectChanges();

    (component as any).draft.set({
      version: '0.1',
      composition: {
        width: 1000,
        height: 1000,
        fps: 30,
        duration: 10000,
      },
      layers: [],
      scenes: [
        {
          id: 'scene-a',
          name: 'Scene A',
          start: 4000,
          duration: 1000,
          layerIds: [],
        },
        {
          id: 'scene-b',
          name: 'Scene B',
          start: 1000,
          duration: 1000,
          layerIds: [],
        },
      ],
    });

    expect((component as any).sceneTimelineRows().map((scene: any) => scene.id)).toEqual([
      'scene-a',
      'scene-b',
    ]);
    expect((component as any).scenes().map((scene: any) => scene.id)).toEqual([
      'scene-b',
      'scene-a',
    ]);
  });
});
