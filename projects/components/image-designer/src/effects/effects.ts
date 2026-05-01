import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageDesignerService } from '../image-designer.service';
import { LayerConfig } from '../types';
import { Panel, PanelContent, PanelHeader } from '@ngstarter-ui/components/panel';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { IMAGE_DESIGNER } from '../tokens';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { Slider } from '@ngstarter-ui/components/slider';
import { SliderThumb } from '@ngstarter-ui/components/slider';
import { Input } from '@ngstarter-ui/components/input';
import { FormsModule } from '@angular/forms';
import { Toolbar, ToolbarSpacer } from '@ngstarter-ui/components/toolbar';

import { ColorPicker } from '@ngstarter-ui/components/color-picker';
import { ColorPickerThumbnail } from '@ngstarter-ui/components/color-picker';
import { ColorPickerTriggerForDirective } from '@ngstarter-ui/components/color-picker';

@Component({
  selector: 'ngs-effects',
  imports: [
    CommonModule,
    Panel,
    PanelHeader,
    PanelContent,
    Button,
    Icon,
    SlideToggle,
    Slider,
    SliderThumb,
    Input,
    FormsModule,
    Toolbar,
    ToolbarSpacer,
    ColorPicker,
    ColorPickerThumbnail,
    ColorPickerTriggerForDirective
  ],
  templateUrl: './effects.html',
  styleUrl: './effects.scss',
})
export class Effects {
  private designerService = inject(ImageDesignerService);
  private imageDesigner = inject(IMAGE_DESIGNER);

  selectedLayerId = this.designerService.selectedLayerId;
  layers = this.designerService.layers;

  selectedLayer = computed(() => {
    const id = this.selectedLayerId();
    if (!id) return null;
    return this.layers().find(l => l.id === id) as LayerConfig;
  });

  private defaultThumb = 'https://picsum.photos/id/11/200/200';

  selectedLayerThumb = computed(() => {
    const id = this.selectedLayerId();
    if (!id) return this.defaultThumb;
    return this.designerService.getLayerThumbnail(id) || this.defaultThumb;
  });

  effects = computed(() => {
    const id = this.selectedLayerId();
    const thumb = this.selectedLayerThumb();
    if (!id) {
      return [
        { id: 'none', name: 'Original', thumb },
        { id: 'grayscale', name: 'Grayscale', thumb },
        { id: 'sepia', name: 'Sepia', thumb },
        { id: 'cold', name: 'Cold', thumb },
        { id: 'warm', name: 'Warm', thumb },
      ];
    }

    return [
      { id: 'none', name: 'Original', thumb: this.designerService.getLayerThumbnail(id, 'none') || thumb },
      { id: 'grayscale', name: 'Grayscale', thumb: this.designerService.getLayerThumbnail(id, 'grayscale') || thumb },
      { id: 'sepia', name: 'Sepia', thumb: this.designerService.getLayerThumbnail(id, 'sepia') || thumb },
      { id: 'cold', name: 'Cold', thumb: this.designerService.getLayerThumbnail(id, 'cold') || thumb },
      { id: 'warm', name: 'Warm', thumb: this.designerService.getLayerThumbnail(id, 'warm') || thumb },
    ];
  });

  adjustments = signal([
    { id: 'blur', name: 'Blur', min: 0, max: 20, step: 1, default: 0 },
    // { id: 'brightness', name: 'Brightness', min: -1, max: 1, step: 0.1, default: 0 },
    // { id: 'temperature', name: 'Temperature', min: -100, max: 100, step: 1, default: 0 },
    // { id: 'contrast', name: 'Contrast', min: -100, max: 100, step: 1, default: 0 },
    // { id: 'white', name: 'White', min: -100, max: 100, step: 1, default: 0 },
    // { id: 'black', name: 'Black', min: -100, max: 100, step: 1, default: 0 },
    // { id: 'vibrance', name: 'Vibrance', min: -100, max: 100, step: 1, default: 0 },
    // { id: 'saturation', name: 'Saturation', min: -100, max: 100, step: 1, default: 0 },
    { id: 'border', name: 'Border', min: 0, max: 50, step: 1, default: 0 },
    { id: 'cornerRadius', name: 'Corner Radius', min: 0, max: 100, step: 1, default: 0 },
    { id: 'shadow', name: 'Shadow', isGroup: true, controls: [
      { id: 'shadowBlur', name: 'Blur', min: 0, max: 100, step: 1, default: 15 },
      { id: 'shadowOffsetX', name: 'Offset X', min: -100, max: 100, step: 1, default: 0 },
      { id: 'shadowOffsetY', name: 'Offset Y', min: -100, max: 100, step: 1, default: 0 },
      { id: 'shadowOpacity', name: 'Opacity', min: 0, max: 100, step: 1, default: 100 },
      { id: 'shadowColor', name: 'Color', type: 'color', default: '#000000' }
    ]}
  ]);

  async applyEffect(effectId: string) {
    const id = this.selectedLayerId();
    if (id) {
      await this.designerService.updateLayer(id, { effect: effectId });
    }
  }

  async resetAll() {
    const id = this.selectedLayerId();
    if (id) {
      const config: any = { effect: 'none' };
      this.adjustments().forEach(adj => {
        config[`${adj.id}Enabled`] = false;
        if (adj.isGroup) {
          adj.controls.forEach(ctrl => {
            config[ctrl.id] = ctrl.default;
          });
        } else {
          config[adj.id] = adj.default;
        }
      });
      await this.designerService.updateLayer(id, config);
    }
  }

  async updateAdjustment(id: string, value: any) {
    const layerId = this.selectedLayerId();
    if (layerId) {
      await this.designerService.updateLayer(layerId, { [id]: value });
    }
  }

  async toggleAdjustment(id: string, enabled: boolean) {
    const layerId = this.selectedLayerId();
    if (layerId) {
      const config: any = { [`${id}Enabled`]: enabled };
      if (!enabled) {
        const adj = this.adjustments().find(a => a.id === id);
        if (adj) {
          if (adj.isGroup) {
            adj.controls.forEach(control => {
              config[control.id] = control.default;
            });
          } else {
            config[id] = adj.default;
          }
        }
      }
      await this.designerService.updateLayer(layerId, config);
    }
  }

  close() {
    this.imageDesigner.effectsPortal.set(null);
  }
}
