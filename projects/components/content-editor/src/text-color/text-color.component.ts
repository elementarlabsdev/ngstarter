import { Component, input, model, output } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { Tooltip } from '@ngstarter/components/tooltip';

export interface TextColor {
  name: string;
  color: string;
  type: string;
}

@Component({
  selector: 'ngs-text-color',
  imports: [
    Icon,
    Tooltip
  ],
  templateUrl: './text-color.component.html',
  styleUrl: './text-color.component.scss'
})
export class TextColorComponent {
  recentlyUsed = model<TextColor[]>(
    localStorage ? JSON.parse(localStorage.getItem('ngsContentEditorRecentlyUsedTextColor') || '[]') : []
  );
  selectedTextColor = model<TextColor | null>(null);
  selectedBackgroundColor = model<TextColor | null>(null);

  textColors = input<TextColor[]>([
    {
      name: 'Default',
      color: '',
      type: 'text'
    },
    {
      name: 'Gray',
      color: '#7f7f7f',
      type: 'text'
    },
    {
      name: 'Brown',
      color: '#ae2012',
      type: 'text'
    },
    {
      name: 'Orange',
      color: '#fb5607',
      type: 'text'
    },
    {
      name: 'Yellow',
      color: '#ffa200',
      type: 'text'
    },
    {
      name: 'Green',
      color: '#40916c',
      type: 'text'
    },
    {
      name: 'Blue',
      color: '#00bbf9',
      type: 'text'
    },
    {
      name: 'Purple',
      color: '#907ad6',
      type: 'text'
    },
    {
      name: 'Pink',
      color: '#fa3faf',
      type: 'text'
    },
    {
      name: 'Red',
      color: '#ef233c',
      type: 'text'
    }
  ]);
  backgroundColors = input<TextColor[]>([
    {
      name: 'Default',
      color: '',
      type: 'background'
    },
    {
      name: 'Gray',
      color: '#e9ecef',
      type: 'background'
    },
    {
      name: 'Brown',
      color: '#ffe0c0',
      type: 'background'
    },
    {
      name: 'Orange',
      color: '#ffd8c6',
      type: 'background'
    },
    {
      name: 'Yellow',
      color: '#fff3b0',
      type: 'background'
    },
    {
      name: 'Green',
      color: '#eff6e0',
      type: 'background'
    },
    {
      name: 'Blue',
      color: '#edf6f9',
      type: 'background'
    },
    {
      name: 'Purple',
      color: '#e0aaff',
      type: 'background'
    },
    {
      name: 'Pink',
      color: '#fae0ec',
      type: 'background'
    },
    {
      name: 'Red',
      color: '#ffdccc',
      type: 'background'
    }
  ]);

  readonly textColorChanged = output<string>();
  readonly backgroundColorChanged = output<string>();

  selectRecentlyColor(color: TextColor) {
    if (color.type === 'text') {
      this.selectTextColor(color);
    } else if (color.type === 'background') {
      this.selectBackgroundColor(color);
    }
  }

  selectTextColor(color: TextColor) {
    this.selectedTextColor.set(color);
    this.textColorChanged.emit(color.color);
    this._addToRecently(color);
  }

  selectBackgroundColor(color: TextColor) {
    this.selectedBackgroundColor.set(color);
    this.backgroundColorChanged.emit(color.color);
    this._addToRecently(color);
  }

  private _addToRecently(color: TextColor) {
    const hasRecentlyUsed = this.recentlyUsed()
      .filter(recentlyColor => recentlyColor.name === color.name && recentlyColor.type === color.type)
      .length > 0;

    if (hasRecentlyUsed) {
      return;
    }

    let colors = [...this.recentlyUsed()];
    colors = colors.length >= 5 ? colors.slice(1, 5) : colors;
    this.recentlyUsed.set([...colors, color]);
    localStorage.setItem('ngsContentEditorRecentlyUsedTextColor', JSON.stringify(this.recentlyUsed()));
  }
}
