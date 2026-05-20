import { ComponentFixture, TestBed } from '@angular/core/testing';

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
});
