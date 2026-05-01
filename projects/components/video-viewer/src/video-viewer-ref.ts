import { EventEmitter } from '@angular/core';

export class VideoViewerRef {
  readonly closed = new EventEmitter();

  close(): void {
    this.closed.emit();
  }
}
