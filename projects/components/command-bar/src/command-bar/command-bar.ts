import {
  booleanAttribute,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  Renderer2
} from '@angular/core';
import { CommandBarPosition } from '../types';

@Component({
  selector: 'ngs-command-bar',
  exportAs: 'ngsCommandBar',
  standalone: true,
  templateUrl: './command-bar.html',
  styleUrl: './command-bar.scss',
  host: {
    'class': 'ngs-command-bar',
    '[class.is-open]': 'open()',
  }
})
export class CommandBar {
  private _elementRef = inject(ElementRef);
  private _renderer = inject(Renderer2);

  open = input(false, {
    transform: booleanAttribute
  });
  position = input<CommandBarPosition>('bottom');

  constructor() {
    effect(() => {
      this._renderer.setAttribute(this._elementRef.nativeElement, 'ngs-command-bar-position', this.position());
    });
  }
}
