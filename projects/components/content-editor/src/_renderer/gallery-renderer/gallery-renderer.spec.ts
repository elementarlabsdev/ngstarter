import { TestBed } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { createNgsHeadlessEditorText } from '@ngstarter-ui/components/headless-editor';
import { ContentEditorGalleryRenderer } from './gallery-renderer';
import { ContentEditorGalleryImage } from '../../types';
import { provideContentEditor } from '../../content-editor.plugin';

const picture = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const images = (): ContentEditorGalleryImage[] => [
  { id: 'first', src: picture, alt: 'Meeting room', caption: [createNgsHeadlessEditorText('First caption', [{ type: 'bold' }])] },
  { id: 'second', src: picture, alt: 'Another room', caption: [createNgsHeadlessEditorText('Second caption')] },
  { id: 'third', src: picture, alt: 'Third room', caption: [] },
];

async function createGallery(pictures = images()) {
  TestBed.configureTestingModule({ imports: [ContentEditorGalleryRenderer], providers: [provideContentEditor()] });
  const fixture = TestBed.createComponent(ContentEditorGalleryRenderer);
  fixture.nativeElement.style.width = '640px';
  fixture.nativeElement.style.setProperty('--spacing', '0.25rem');
  fixture.componentRef.setInput('content', { images: pictures });
  fixture.autoDetectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('Content editor carousel preview', () => {
  afterEach(() => {
    TestBed.inject(OverlayContainer).ngOnDestroy();
    TestBed.resetTestingModule();
  });

  it('keeps the photograph visible and sized independently of button height, with reader-only navigation', async () => {
    const fixture = await createGallery();
    const element: HTMLElement = fixture.nativeElement;
    const card = element.querySelector('ngs-carousel-card') as HTMLElement;
    const button = card.querySelector('.gallery-picture') as HTMLButtonElement;
    const image = button.querySelector('img')!;
    await expect.poll(() => image.naturalWidth).toBe(1);
    expect(card.getBoundingClientRect().width).toBe(640);
    expect(image.getBoundingClientRect().height).toBe(360);
    expect(button.getBoundingClientRect().height).toBe(image.getBoundingClientRect().height);
    expect(getComputedStyle(button).padding).toBe('0px');
    expect(element.querySelector('figcaption strong')?.textContent).toBe('First caption');
    expect(element.querySelector('.gallery-counter')?.textContent).toBe('1 of 3');
    expect(element.querySelectorAll('.thumbnail-picture')).toHaveLength(3);
    expect(element.querySelector('input, [cdkDrag], [ngsUploadTrigger]')).toBeNull();
    fixture.nativeElement.style.width = '240px';
    await expect.poll(() => image.getBoundingClientRect().height).toBe(135);
  });

  it('synchronizes thumbnail selection, caption, slide accessibility and navigation bounds', async () => {
    const fixture = await createGallery();
    const element: HTMLElement = fixture.nativeElement;
    (element.querySelector('[aria-label="Select image 2"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    await expect.poll(() => fixture.componentInstance.selectedIndex()).toBe(1);
    expect(element.querySelector('.gallery-caption')?.textContent).toBe('Second caption');
    expect(element.querySelector('.gallery-counter')?.textContent).toBe('2 of 3');
    expect(element.querySelector('[aria-label="Select image 2"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(element.querySelectorAll('ngs-carousel-card[aria-hidden="false"]')).toHaveLength(1);
    const next = element.querySelector('[aria-label="Next image"]') as HTMLButtonElement;
    next.click();
    await fixture.whenStable();
    await expect.poll(() => fixture.componentInstance.selectedIndex()).toBe(2);
    expect(next.disabled).toBe(true);
    expect(element.querySelector('.gallery-caption')?.textContent).toBe('');
    const region = element.querySelector('[aria-roledescription="carousel"]')!;
    region.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
    await fixture.whenStable();
    await expect.poll(() => fixture.componentInstance.selectedIndex()).toBe(0);
    expect((element.querySelector('[aria-label="Previous image"]') as HTMLButtonElement).disabled).toBe(true);
    region.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    await fixture.whenStable();
    await expect.poll(() => fixture.componentInstance.selectedIndex()).toBe(1);
  });

  it('preserves the selected image when content is reordered and recovers after removal', async () => {
    const pictures = images();
    const fixture = await createGallery(pictures);
    fixture.componentInstance.selectImage(1);
    await fixture.whenStable();
    fixture.componentRef.setInput('content', { images: [pictures[1], pictures[0], pictures[2]] });
    await fixture.whenStable();
    expect(fixture.componentInstance.selectedId()).toBe('second');
    expect(fixture.componentInstance.selectedIndex()).toBe(0);
    fixture.componentRef.setInput('content', { images: [pictures[0]] });
    await fixture.whenStable();
    expect(fixture.componentInstance.selectedId()).toBe('first');
    expect(fixture.nativeElement.querySelector('.thumbnail-strip, .gallery-counter, [aria-label="Next image"]')).toBeNull();
    fixture.componentRef.setInput('content', { images: [] });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('figure')).toBeNull();
  });

  it('opens the currently selected image in the existing full-size viewer', async () => {
    const fixture = await createGallery();
    fixture.componentInstance.selectImage(1);
    await fixture.whenStable();
    (fixture.nativeElement.querySelector('[aria-label="View full-size image"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    expect(overlay.querySelector('ngs-image-viewer img')?.getAttribute('src')).toBe(picture);
    expect(overlay.textContent).toContain('Second caption');
  });
});
