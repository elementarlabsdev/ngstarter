import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MotionDocument, createDefaultMotionDocument } from '../schema/motion-document';
import { MotionPlayer } from '../motion-player/motion-player';

@Component({
  selector: 'ngs-motion-renderer',
  imports: [MotionPlayer],
  templateUrl: './motion-renderer.html',
  styleUrl: './motion-renderer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngs-motion-renderer',
  },
})
export class MotionRenderer {
  readonly document = input<MotionDocument | null>(createDefaultMotionDocument());
  readonly time = input<number | null>(null);
  readonly frame = input<number | null>(null);
  readonly scale = input(1);

  protected readonly activeDocument = computed(
    () => this.document() ?? createDefaultMotionDocument(),
  );
  protected readonly renderTime = computed(() => {
    const frame = this.frame();

    if (frame !== null) {
      return (frame / Math.max(1, this.activeDocument().composition.fps)) * 1000;
    }

    return this.time() ?? 0;
  });
}
