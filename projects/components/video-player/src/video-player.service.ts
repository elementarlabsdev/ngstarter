import { Injectable, signal } from '@angular/core';

export interface VideoPlayerInterface {
  pause(): void;
}

@Injectable({
  providedIn: 'root'
})
export class VideoPlayerService {
  private activePlayer = signal<VideoPlayerInterface | null>(null);

  setActivePlayer(player: VideoPlayerInterface) {
    const currentActive = this.activePlayer();
    if (currentActive && currentActive !== player) {
      currentActive.pause();
    }
    this.activePlayer.set(player);
  }

  clearActivePlayer(player: VideoPlayerInterface) {
    if (this.activePlayer() === player) {
      this.activePlayer.set(null);
    }
  }
}
