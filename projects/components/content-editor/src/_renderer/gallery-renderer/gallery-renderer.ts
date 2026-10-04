import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, linkedSignal, untracked, viewChildren } from '@angular/core';
import { NgsHeadlessEditorRuns } from '@ngstarter-ui/components/headless-editor';
import { ImageViewerDirective, ImageViewerPictureDirective } from '@ngstarter-ui/components/image-viewer';
import { Carousel, CarouselCard } from '@ngstarter-ui/components/carousel';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { ContentEditorRendererBase } from '../renderer-base';
import { ContentEditorGalleryContent, ContentEditorGalleryImage } from '../../types';
import { contentEditorText } from '../../document';

@Component({
  selector: 'ngs-content-editor-gallery-renderer',
  imports: [NgsHeadlessEditorRuns, ImageViewerDirective, ImageViewerPictureDirective, Carousel, CarouselCard, Button, Icon],
  templateUrl: './gallery-renderer.html', styleUrl: './gallery-renderer.scss', changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentEditorGalleryRenderer extends ContentEditorRendererBase<ContentEditorGalleryContent> {
  readonly images = computed(() => this.content()?.images ?? []);
  readonly selectedId = linkedSignal<readonly ContentEditorGalleryImage[], string | null>({
    source: this.images,
    computation: (images, previous) => {
      if (images.some(image => image.id === previous?.value)) return previous!.value;
      const previousIndex = previous?.source.findIndex(image => image.id === previous.value) ?? 0;
      return images[Math.min(Math.max(previousIndex, 0), images.length - 1)]?.id ?? null;
    }
  });
  readonly selectedIndex = computed(() => this.images().findIndex(image => image.id === this.selectedId()));
  readonly selectedImage = computed(() => this.images()[this.selectedIndex()] ?? null);
  readonly captionText = contentEditorText;
  private readonly cards = viewChildren(CarouselCard);
  private readonly thumbnails = viewChildren('thumbnailButton', { read: ElementRef<HTMLElement> });

  constructor() {
    super();
    afterRenderEffect(() => {
      this.images();
      untracked(() => this.scrollToImage(this.selectedIndex(), 'instant'));
    });
  }

  selectImage(index: number): void {
    const image = this.images()[index];
    if (!image) return;
    this.selectedId.set(image.id);
    this.scrollToImage(index, 'smooth');
    this.revealThumbnail(index);
  }

  onIndexChange(index: number): void {
    const image = this.images()[index];
    if (!image) return;
    this.selectedId.set(image.id);
    this.revealThumbnail(index);
  }

  onKeydown(event: KeyboardEvent): void {
    let index: number;
    switch (event.key) {
      case 'ArrowLeft': index = this.selectedIndex() - 1; break;
      case 'ArrowRight': index = this.selectedIndex() + 1; break;
      case 'Home': index = 0; break;
      case 'End': index = this.images().length - 1; break;
      default: return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.selectImage(index);
  }

  private scrollToImage(index: number, behavior: ScrollBehavior): void {
    const card = this.cards()[index]?.element;
    const track = card?.parentElement;
    if (card && track) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior });
  }

  private revealThumbnail(index: number): void {
    const thumbnail = this.thumbnails()[index]?.nativeElement;
    const strip = thumbnail?.parentElement;
    if (!thumbnail || !strip) return;
    const left = thumbnail.offsetLeft - strip.offsetLeft;
    const right = left + thumbnail.offsetWidth;
    if (left < strip.scrollLeft) strip.scrollTo({ left, behavior: 'smooth' });
    else if (right > strip.scrollLeft + strip.clientWidth) {
      strip.scrollTo({ left: right - strip.clientWidth, behavior: 'smooth' });
    }
  }
}
