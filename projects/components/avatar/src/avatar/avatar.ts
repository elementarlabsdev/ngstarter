import {
  AfterViewInit,
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { AVATAR_ACCESSOR, AvatarAppearance, AvatarKey, AvatarPresenceIndicator, AvatarVariant } from '../types';
import { AVATAR_CONFIG } from '../config';
import { AvatarGenerator, GeneratedAvatar } from './avatar-generator';

const alreadyLoadedImages: string[] = [];

@Component({
  selector: 'ngs-avatar,[ngs-avatar]',
  exportAs: 'ngsAvatar',
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
  providers: [
    {
      provide: AVATAR_ACCESSOR,
      useExisting: forwardRef(() => Avatar),
      multi: true
    }
  ],
  host: {
    'class': 'ngs-avatar',
    '[class.is-clickable]': 'clickable()',
    '[class.has-automatic-color]': '!!automaticColor()',
    '[class.has-generated-avatar]': '!!generatedAvatar()',
    '[class.has-loaded-image]': 'image() && imageLoaded',
    '[class.is-solid]': 'variant() === "solid"',
    '[class.is-tonal]': 'variant() === "tonal"',
    '[class.is-outlined]': 'variant() === "outlined"',
    '[class.is-plain]': 'variant() === "plain"',
  }
})
export class Avatar implements OnInit, OnChanges, AfterViewInit {
  private _elementRef = inject(ElementRef);
  private _config = inject(AVATAR_CONFIG, { optional: true });
  private readonly _avatarGenerator = new AvatarGenerator();

  image = input<string>('');
  variant = input<AvatarVariant>('');
  clickable = input(false, {
    transform: booleanAttribute
  });
  label = input('');
  key = input<AvatarKey>('');
  appearance = input<AvatarAppearance | undefined>();
  backgroundColors = input<string[]>([]);
  foregroundColors = input<string[]>([]);
  alt = input('');
  automaticColor = input();
  presenceIndicator = input<AvatarPresenceIndicator>(null);

  protected imageLoaded: boolean;
  protected showLabel = false;
  protected readonly generatedAvatar = computed<GeneratedAvatar | null>(() => {
    return this._avatarGenerator.generate({
      appearance: this.appearance() || this._config?.appearance || 'default',
      seed: this._seed(),
      label: this.label(),
      backgroundColors: this.backgroundColors(),
      foregroundColors: this.foregroundColors()
    });
  });

  ngOnInit() {
    if (!this.image()) {
      return;
    }

    this.imageLoaded = alreadyLoadedImages.includes(<string>this.image());
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.showLabel = true;
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['image']) {
      this.imageLoaded = alreadyLoadedImages.includes(<string>this.image());
    }

    if (changes['automaticColor'] && changes['automaticColor'].currentValue) {
      this._setAutomaticColor(changes['automaticColor'].currentValue);
    }
  }

  onImageLoaded(): void {
    if (this.imageLoaded) {
      return;
    }

    alreadyLoadedImages.push(<string>this.image());
    this.imageLoaded = true;
  }

  private _setAutomaticColor(color: any): void {
    if (!this.isValidHex(color)) {
      throw new Error(`Invalid ${color} color, automatic color supports only a valid hex color`);
    }

    const element = this._elementRef.nativeElement as HTMLElement;
    element.style.setProperty('--ngs-avatar-bg', color);
    element.style.setProperty('--ngs-avatar-border-color-auto', this._newShade(color, -25));
    element.style.setProperty('--ngs-avatar-color', this._newShade(color, -150));
  }

  private _newShade(hexColor: string, magnitude: number): string {
    hexColor = hexColor.replace(`#`, ``);
      if (hexColor.length === 6) {
      const decimalColor = parseInt(hexColor, 16);
      let r = (decimalColor >> 16) + magnitude;
      r > 255 && (r = 255);
      r < 0 && (r = 0);
      let g = (decimalColor & 0x0000ff) + magnitude;
      g > 255 && (g = 255);
      g < 0 && (g = 0);
      let b = ((decimalColor >> 8) & 0x00ff) + magnitude;
      b > 255 && (b = 255);
      b < 0 && (b = 0);
      return `#${(g | (b << 8) | (r << 16)).toString(16)}`;
    } else {
      return hexColor;
    }
  };

  private _seed(): string {
    return String(this.key() || this.label() || this.alt() || '');
  }

  isValidHex(color: any): boolean {
    if(!color || typeof color !== 'string') {
      return false;
    }

    // Validate hex values
    if(color.substring(0, 1) === '#') {
      color = color.substring(1);
    }

    switch(color.length) {
      case 3: {
        return /^[0-9A-F]{3}$/i.test(color);
      }
      case 6: {
        return /^[0-9A-F]{6}$/i.test(color);
      }
      case 8: {
        return /^[0-9A-F]{8}$/i.test(color);
      }
      default: {
        return false;
      }
    }
  }
}
