import '@angular/compiler';
import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { ApplicationRef, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ImageZoomViewerImage } from '../image-zoom-viewer-image';
import { ImageZoomViewer } from './image-zoom-viewer';

const imageRect = {
  x: 100,
  y: 50,
  left: 100,
  top: 50,
  right: 300,
  bottom: 150,
  width: 200,
  height: 100,
  toJSON: () => ({}),
} as DOMRect;

const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;
const originalInnerWidth = window.innerWidth;
const originalInnerHeight = window.innerHeight;

@Component({
  standalone: true,
  imports: [ImageZoomViewer, ImageZoomViewerImage],
  template: `
    <ngs-image-zoom-viewer>
      <img
        ngsImageZoomViewerImage
        src="https://example.com/report.png"
        alt="Report preview"
      />
    </ngs-image-zoom-viewer>
  `,
})
class ImageZoomViewerHost {}

describe('ImageZoomViewer', () => {
  beforeAll(() => {
    setViewport(1000, 800);

    Object.defineProperty(globalThis, 'requestAnimationFrame', {
      configurable: true,
      value: (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      },
    });

    Object.defineProperty(globalThis, 'cancelAnimationFrame', {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    setViewport(1000, 800);

    const overlayContainer = TestBed.inject(OverlayContainer, null, { optional: true });
    overlayContainer?.ngOnDestroy();
    TestBed.resetTestingModule();
  });

  afterAll(() => {
    Object.defineProperty(globalThis, 'requestAnimationFrame', {
      configurable: true,
      value: originalRequestAnimationFrame,
    });
    Object.defineProperty(globalThis, 'cancelAnimationFrame', {
      configurable: true,
      value: originalCancelAnimationFrame,
    });
    setViewport(originalInnerWidth, originalInnerHeight);
  });

  it('projects an image and syncs the image source and alt text', async () => {
    const fixture = await createFixture();
    const viewer = getViewer(fixture);
    const host = hostElement(fixture);

    expect(host.classList.contains('ngs-image-zoom-viewer')).toBe(true);
    expect(host.querySelector('img[ngsImageZoomViewerImage]')).toBeTruthy();
    expect(viewer.imageSrc()).toBe('https://example.com/report.png');
    expect(viewer.imageAlt()).toBe('Report preview');
    expect(viewer.isZoomed()).toBe(false);
  });

  it('opens a zoom overlay with the cloned image and calculated transform', async () => {
    const fixture = await createFixture();
    const viewer = getViewer(fixture);

    openZoom(fixture);

    const cloned = clonedImage();
    expect(viewer.isZoomed()).toBe(true);
    expect(containerElement(fixture).classList.contains('is-zoomed')).toBe(true);
    expect(overlayRoot().querySelector('.ngs-image-zoom-backdrop')).toBeTruthy();
    expect(overlayRoot().querySelector('.ngs-image-zoom-wrapper')).toBeTruthy();
    expect(cloned.src).toBe('https://example.com/report.png');
    expect(cloned.alt).toBe('Report preview');
    expect(cloned.style.width).toBe('200px');
    expect(cloned.style.height).toBe('100px');
    expect(cloned.style.top).toBe('50px');
    expect(cloned.style.left).toBe('100px');
    expect(cloned.style.transform).toBe('translate(300px, 300px) scale(4.5)');
  });

  it('recalculates the zoom transform on resize', async () => {
    const fixture = await createFixture();
    const viewer = getViewer(fixture);

    openZoom(fixture);
    expect(viewer.zoomedTransform()).toBe('translate(300px, 300px) scale(4.5)');

    setViewport(1200, 900);
    window.dispatchEvent(new Event('resize'));
    detectOverlayChanges();

    expect(viewer.zoomedTransform()).toBe('translate(400px, 350px) scale(5.4)');
    expect(clonedImage().style.transform).toBe('translate(400px, 350px) scale(5.4)');
  });

  it('closes the overlay from the backdrop after the exit delay', async () => {
    vi.useFakeTimers();
    const fixture = await createFixture();
    const viewer = getViewer(fixture);

    openZoom(fixture);
    const backdrop = overlayRoot().querySelector('.ngs-image-zoom-backdrop') as HTMLElement;
    backdrop.click();
    detectOverlayChanges();

    expect(backdrop.classList.contains('is-closing')).toBe(true);
    expect(viewer.zoomedTransform()).toBe('translate(0, 0) scale(1)');

    vi.advanceTimersByTime(250);
    detectOverlayChanges();

    expect(viewer.isZoomed()).toBe(false);
    expect(overlayRoot().querySelector('.ngs-image-zoom-wrapper')).toBeNull();
  });

  it('closes the overlay from Escape', async () => {
    vi.useFakeTimers();
    const fixture = await createFixture();
    const viewer = getViewer(fixture);

    openZoom(fixture);
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    detectOverlayChanges();

    vi.advanceTimersByTime(250);
    detectOverlayChanges();

    expect(viewer.isZoomed()).toBe(false);
    expect(overlayRoot().querySelector('.ngs-image-zoom-wrapper')).toBeNull();
  });
});

async function createFixture(): Promise<ComponentFixture<ImageZoomViewerHost>> {
  await TestBed.configureTestingModule({
    imports: [OverlayModule, ImageZoomViewerHost],
  }).compileComponents();

  const fixture = TestBed.createComponent(ImageZoomViewerHost);
  fixture.detectChanges();
  mockImageRect(fixture);
  fixture.detectChanges();

  return fixture;
}

function getViewer(fixture: ComponentFixture<ImageZoomViewerHost>): ImageZoomViewer {
  return fixture.debugElement.query(By.directive(ImageZoomViewer)).componentInstance as ImageZoomViewer;
}

function hostElement(fixture: ComponentFixture<ImageZoomViewerHost>): HTMLElement {
  return fixture.nativeElement.querySelector('ngs-image-zoom-viewer') as HTMLElement;
}

function containerElement(fixture: ComponentFixture<ImageZoomViewerHost>): HTMLElement {
  return fixture.nativeElement.querySelector('.ngs-image-zoom-container') as HTMLElement;
}

function mockImageRect(fixture: ComponentFixture<ImageZoomViewerHost>): void {
  const image = fixture.nativeElement.querySelector('img[ngsImageZoomViewerImage]') as HTMLImageElement;
  Object.defineProperty(image, 'getBoundingClientRect', {
    configurable: true,
    value: () => imageRect,
  });
}

function openZoom(fixture: ComponentFixture<ImageZoomViewerHost>): void {
  containerElement(fixture).click();
  detectOverlayChanges();
}

function overlayRoot(): HTMLElement {
  return TestBed.inject(OverlayContainer).getContainerElement();
}

function clonedImage(): HTMLImageElement {
  return overlayRoot().querySelector('.ngs-image-zoom-cloned') as HTMLImageElement;
}

function detectOverlayChanges(): void {
  TestBed.inject(ApplicationRef).tick();
}

function setViewport(width: number, height: number): void {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: height,
  });
}
