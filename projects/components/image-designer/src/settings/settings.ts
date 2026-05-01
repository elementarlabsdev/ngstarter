import { CommonModule, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { IMAGE_DESIGNER } from '../tokens';
import { ImageDesignerService } from '../image-designer.service';
import { LayerConfig } from '../types';
import { ColorSwitcher } from '@ngstarter/components/color-switcher';
import { Slider } from '@ngstarter/components/slider';
import { SliderThumb } from '@ngstarter/components/slider';
import { Toolbar, ToolbarItem, ToolbarSpacer } from '@ngstarter/components/toolbar';
import { Popover, PopoverContent, PopoverTriggerForDirective } from '@ngstarter/components/popover';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { Divider } from '@ngstarter/components/divider';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter/components/menu';
import { ButtonToggle, ButtonToggleGroup } from '@ngstarter/components/button-toggle';
import { Ripple } from '@ngstarter/components/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ngs-settings',
  imports: [
    CommonModule,
    ColorSwitcher,
    Slider,
    SliderThumb,
    Toolbar,
    ToolbarItem,
    Popover,
    PopoverContent,
    PopoverTriggerForDirective,
    Button,
    Icon,
    Divider,
    DecimalPipe,
    Menu,
    MenuItem,
    MenuTrigger,
    Ripple,
    ToolbarSpacer,
    ButtonToggle,
    ButtonToggleGroup,
    FormsModule
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  private imageDesigner = inject(IMAGE_DESIGNER, { optional: true });
  private designerService = inject(ImageDesignerService);

  selectedLayerId = this.designerService.selectedLayerId;
  layers = this.designerService.layers;
  fonts = this.designerService.fonts;

  selectedLayer = computed(() => {
    const id = this.selectedLayerId();
    if (!id) return null;
    return this.layers().find(l => l.id === id) as LayerConfig;
  });

  showColorPicker = computed(() => {
    const layer = this.selectedLayer();
    if (!layer) return false;
    return ['text', 'shape', 'pattern'].includes(layer.type);
  });

  presetColors = signal<string[]>([
    '#000000', '#7a7a7a', '#ffffff',
    '#f44336', '#e91e63', '#9c27b0',
    '#673ab7', '#3f51b5', '#2196f3',
    '#03a9f4', '#00bcd4', '#009688',
    '#4caf50', '#8bc34a', '#cddc39',
    '#ffeb3b', '#ffc107', '#ff9800',
    '#ff5722', '#795548', '#607d8b'
  ]);

  fontWeightNames: Record<number, string> = {
    100: 'Thin',
    200: 'Extra Light',
    300: 'Light',
    400: 'Regular',
    500: 'Medium',
    600: 'Semi Bold',
    700: 'Bold',
    800: 'Extra Bold',
    900: 'Black'
  };

  getFontWeightName(value: any): string {
    const numericValue = value === 'bold' ? 700 : (value === 'normal' ? 400 : (parseInt(value, 10) || 400));
    return this.fontWeightNames[numericValue] || numericValue.toString();
  }

  async updateOpacity(value: number) {
    const id = this.selectedLayerId();
    if (id) {
      await this.designerService.updateLayer(id, { opacity: value });
    }
  }

  async updateColor(color: string) {
    const id = this.selectedLayerId();
    const layer = this.selectedLayer();
    if (id && layer) {
      await this.designerService.updateLayer(id, { fill: color, type: layer.type });
    }
  }

  async updateFont(font: string) {
    const id = this.selectedLayerId();
    if (id) {
      await this.designerService.loadFont(font);
      await this.designerService.updateLayer(id, { fontFamily: font });
    }
  }

  async updateFontWeight(value: number) {
    const id = this.selectedLayerId();
    if (id) {
      await this.designerService.updateLayer(id, { fontWeight: value });
    }
  }

  async updateTextStyle(style: string[]) {
    const id = this.selectedLayerId();
    if (!id) return;

    const decorations = [];
    if (style.includes('underline')) decorations.push('underline');
    if (style.includes('line-through')) decorations.push('line-through');

    const config: any = {
      fontStyle: style.includes('italic') ? 'italic' : 'normal',
      textDecoration: decorations.join(' ') || 'none'
    };

    await this.designerService.updateLayer(id, config);
  }

  async toggleUppercase() {
    const id = this.selectedLayerId();
    const layer = this.selectedLayer();
    if (id && layer) {
      const currentCase = layer['textCase'];
      const newCase = currentCase === 'upper' ? 'normal' : 'upper';
      await this.designerService.updateLayer(id, { textCase: newCase });
    }
  }

  async updateTextAlign(align: string) {
    const id = this.selectedLayerId();
    if (id) {
      await this.designerService.updateLayer(id, { align });
    }
  }

  async updateLineHeight(value: number) {
    const id = this.selectedLayerId();
    if (id) {
      await this.designerService.updateLayer(id, { lineHeight: value });
    }
  }

  async updateLetterSpacing(value: number) {
    const id = this.selectedLayerId();
    if (id) {
      await this.designerService.updateLayer(id, { letterSpacing: value });
    }
  }

  getTextStyle = computed(() => {
    const layer = this.selectedLayer();
    if (!layer) return [];
    const styles = [];
    if (layer['fontStyle'] === 'italic') styles.push('italic');
    const decoration = layer['textDecoration'] || '';
    if (decoration.includes('underline')) styles.push('underline');
    if (decoration.includes('line-through')) styles.push('line-through');
    return styles;
  }, {
    equal: (a, b) => {
      if (a.length !== b.length) return false;
      return a.every((v, i) => v === b[i]);
    }
  });

  toggleLock() {
    const id = this.selectedLayerId();
    if (id) {
      this.designerService.toggleLayerLock(id);
    }
  }

  async flipHorizontal() {
    const id = this.selectedLayerId();
    if (id) {
      await this.designerService.flipHorizontal(id);
    }
  }

  async flipVertical() {
    const id = this.selectedLayerId();
    if (id) {
      await this.designerService.flipVertical(id);
    }
  }

  async fitToPage() {
    const id = this.selectedLayerId();
    if (id) {
      await this.designerService.fitToPage(id);
    }
  }

  async fillPage() {
    const id = this.selectedLayerId();
    if (id) {
      await this.designerService.fillPage(id);
    }
  }

  saveSnapshot() {
    const snapshot = this.designerService.getSnapshot();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshot));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "design-snapshot.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  loadSnapshot(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const snapshot = JSON.parse(e.target?.result as string);
          await this.designerService.loadSnapshot(snapshot);
        } catch (error) {
          console.error('Failed to load snapshot:', error);
        }
      };
      reader.readAsText(input.files[0]);
    }
  }

  openEffects() {
    this.imageDesigner?.openEffects();
  }
}
