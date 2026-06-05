import '@angular/compiler';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { Marquee } from './marquee';

const animationFrames = new Map<number, FrameRequestCallback>();
const resizeObservers: ResizeObserverMock[] = [];
let nextAnimationFrameId = 1;

class ResizeObserverMock {
  constructor(private readonly callback: ResizeObserverCallback) {
    resizeObservers.push(this);
  }

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  trigger(): void {
    this.callback([], this as unknown as ResizeObserver);
  }
}

class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

@Component({
  imports: [Marquee],
  template: `
    <ngs-marquee [pauseOnHover]="pauseOnHover" [reverse]="reverse">
      <span class="marquee-text">{{ text }}</span>
    </ngs-marquee>
  `,
})
class MarqueeHost {
  text = 'Contributions are welcome';
  pauseOnHover = false;
  reverse = false;
}

describe('Marquee', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      value: ResizeObserverMock,
    });

    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      value: IntersectionObserverMock,
    });

    Object.defineProperty(globalThis, 'requestAnimationFrame', {
      configurable: true,
      value: (callback: FrameRequestCallback) => {
        const id = nextAnimationFrameId++;
        animationFrames.set(id, callback);

        return id;
      },
    });

    Object.defineProperty(globalThis, 'cancelAnimationFrame', {
      configurable: true,
      value: (id: number) => {
        animationFrames.delete(id);
      },
    });
  });

  afterEach(() => {
    animationFrames.clear();
    resizeObservers.length = 0;
    TestBed.resetTestingModule();
  });

  it('creates only one duplicate item to continue the loop', async () => {
    const fixture = await createFixture({ contentWidth: 500, itemWidth: 200 });
    const host = marqueeHost(fixture);

    expect(items(fixture)).toHaveLength(2);
    expect(clones(fixture)).toHaveLength(1);
    expect(sourceItem(fixture).hasAttribute('data-ngs-marquee-clone')).toBe(false);
    expect(clones(fixture)[0].getAttribute('aria-hidden')).toBe('true');
    expect(clones(fixture)[0].hasAttribute('inert')).toBe(true);
    expect(host.style.getPropertyValue('--ngs-marquee-item-width')).toBe('200px');
    expect(host.style.getPropertyValue('--ngs-marquee-repeat-gap')).toBe('300px');
  });

  it('does not add spacing between items when the content is wider than the viewport', async () => {
    const fixture = await createFixture({ contentWidth: 320, itemWidth: 520 });
    const host = marqueeHost(fixture);

    expect(items(fixture)).toHaveLength(2);
    expect(clones(fixture)).toHaveLength(1);
    expect(host.style.getPropertyValue('--ngs-marquee-item-width')).toBe('520px');
    expect(host.style.getPropertyValue('--ngs-marquee-repeat-gap')).toBe('0px');
  });

  it('replaces the duplicate item when content is measured again', async () => {
    const fixture = await createFixture({ contentWidth: 500, itemWidth: 200 });
    const firstClone = clones(fixture)[0];

    setRects(fixture, { contentWidth: 640, itemWidth: 240 });
    triggerResize();

    expect(items(fixture)).toHaveLength(2);
    expect(clones(fixture)).toHaveLength(1);
    expect(clones(fixture)[0]).not.toBe(firstClone);
    expect(marqueeHost(fixture).style.getPropertyValue('--ngs-marquee-item-width')).toBe('240px');
    expect(marqueeHost(fixture).style.getPropertyValue('--ngs-marquee-repeat-gap')).toBe('400px');
  });

  it('keeps pause-on-hover and reverse inputs reflected as animation variables', async () => {
    const fixture = await createFixture({
      contentWidth: 500,
      itemWidth: 200,
      pauseOnHover: true,
      reverse: true,
    });
    const host = marqueeHost(fixture);

    expect(host.style.getPropertyValue('--ngs-marquee-pause')).toBe('paused');
    expect(host.style.getPropertyValue('--ngs-marquee-reverse')).toBe('reverse');
  });
});

async function createFixture(options: {
  contentWidth: number;
  itemWidth: number;
  pauseOnHover?: boolean;
  reverse?: boolean;
}): Promise<ComponentFixture<MarqueeHost>> {
  await TestBed.configureTestingModule({
    imports: [MarqueeHost],
  }).compileComponents();

  const fixture = TestBed.createComponent(MarqueeHost);
  fixture.componentInstance.pauseOnHover = options.pauseOnHover ?? false;
  fixture.componentInstance.reverse = options.reverse ?? false;
  fixture.detectChanges();
  setRects(fixture, options);
  triggerResize();

  return fixture;
}

function setRects(
  fixture: ComponentFixture<MarqueeHost>,
  sizes: { contentWidth: number; itemWidth: number },
): void {
  vi.spyOn(content(fixture), 'getBoundingClientRect').mockImplementation(() =>
    rect(sizes.contentWidth),
  );
  vi.spyOn(sourceItem(fixture), 'getBoundingClientRect').mockImplementation(() =>
    rect(sizes.itemWidth),
  );
}

function triggerResize(): void {
  resizeObservers.forEach((observer) => observer.trigger());

  const callbacks = Array.from(animationFrames.entries());
  animationFrames.clear();
  callbacks.forEach(([id, callback]) => callback(id));
}

function rect(width: number): DOMRect {
  return {
    x: 0,
    y: 0,
    width,
    height: 20,
    top: 0,
    right: width,
    bottom: 20,
    left: 0,
    toJSON: () => ({}),
  } as DOMRect;
}

function marqueeHost(fixture: ComponentFixture<MarqueeHost>): HTMLElement {
  return fixture.nativeElement.querySelector('ngs-marquee') as HTMLElement;
}

function content(fixture: ComponentFixture<MarqueeHost>): HTMLElement {
  return fixture.nativeElement.querySelector('.content') as HTMLElement;
}

function sourceItem(fixture: ComponentFixture<MarqueeHost>): HTMLElement {
  return fixture.nativeElement.querySelector('.item:not([data-ngs-marquee-clone])') as HTMLElement;
}

function items(fixture: ComponentFixture<MarqueeHost>): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('.item'));
}

function clones(fixture: ComponentFixture<MarqueeHost>): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('[data-ngs-marquee-clone]'));
}
