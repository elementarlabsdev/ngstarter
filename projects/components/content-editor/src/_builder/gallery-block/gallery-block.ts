import { ChangeDetectionStrategy, Component, computed, linkedSignal, signal } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { createNgsHeadlessEditorId, createNgsHeadlessEditorText } from '@ngstarter-ui/components/headless-editor';
import { UploadArea, UploadTriggerDirective, UploadFileSelectedEvent } from '@ngstarter-ui/components/upload';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { FormField, Hint, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { Menu, MenuDivider, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { ImageViewerDirective, ImageViewerPictureDirective } from '@ngstarter-ui/components/image-viewer';
import { ContentEditorUploadBlockBase } from '../upload-block-base';
import { ContentEditorGalleryContent, ContentEditorGalleryImage } from '../../types';
import { contentEditorText } from '../../document';
import { ContentEditorUploadStatus } from '../upload-status/upload-status';

@Component({
  selector: 'ngs-content-editor-gallery-block',
  imports: [ContentEditorUploadStatus, UploadArea, UploadTriggerDirective, Button, Icon, FormField, Hint, Label, Input,
    CdkDrag, CdkDragHandle, CdkDropList, Menu, MenuDivider, MenuItem, MenuTrigger, ImageViewerDirective, ImageViewerPictureDirective],
  templateUrl: './gallery-block.html', styleUrl: './gallery-block.scss', changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentEditorGalleryBlock extends ContentEditorUploadBlockBase<ContentEditorGalleryContent> {
  readonly images = computed(() => this.content().images);
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
  readonly replacementId = signal<string | null>(null);
  readonly captionText = contentEditorText;

  selectImage(id: string): void { this.selectedId.set(id); }
  previousImage(): void { const image = this.images()[this.selectedIndex() - 1]; if (image) this.selectImage(image.id); }
  nextImage(): void { const image = this.images()[this.selectedIndex() + 1]; if (image) this.selectImage(image.id); }
  changeAlt(id: string, event: Event): void { this.changeImage(id, { alt: (event.target as HTMLInputElement).value }); }
  changeCaption(id: string, caption: string): void { this.changeImage(id, { caption: [createNgsHeadlessEditorText(caption)] }); }
  private changeImage(id: string, data: Partial<ContentEditorGalleryImage>): void {
    this.save({ images: this.latestContent().images.map(image => image.id === id ? { ...image, ...data } : image) });
  }
  removeImage(id: string): void { this.save({ images: this.latestContent().images.filter(image => image.id !== id) }); }
  moveImage(index: number, direction: number): void { this.reorderImage(index, index + direction); }
  dropImage(event: CdkDragDrop<readonly ContentEditorGalleryImage[]>): void {
    this.reorderImage(event.previousIndex, event.currentIndex);
  }
  private reorderImage(from: number, to: number): void {
    const images = [...this.latestContent().images];
    if (from < 0 || to < 0 || from >= images.length || to >= images.length || from === to) return;
    moveItemInArray(images, from, to);
    this.save({ images });
  }
  requestReplacement(id: string, trigger: UploadTriggerDirective): void {
    this.replacementId.set(id);
    trigger._handleClick();
  }
  async upload(event: UploadFileSelectedEvent, replaceId: string | null = null): Promise<void> {
    const files = replaceId ? event.files.slice(0, 1) : event.files;
    await this.uploadFiles('gallery', { files, accept: file => file.type.startsWith('image/'), apply: results => {
      const images = results.map(({ url, file }) => ({ id: createNgsHeadlessEditorId('image'), src: url, alt: file.name, caption: [] } satisfies ContentEditorGalleryImage));
      if (replaceId) this.changeImage(replaceId, { src: images[0].src });
      else { this.save({ images: [...this.latestContent().images, ...images] }); this.selectImage(images[0].id); }
    } });
  }
}
