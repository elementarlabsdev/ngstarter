import { ChangeDetectionStrategy, Component, Directive, input, output } from '@angular/core';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { Option, Select } from '@ngstarter-ui/components/select';

import { MotionValue } from '../schema/motion-document';

export type MotionTextEffectSettingProperty =
  | 'duration'
  | 'stagger'
  | 'distance'
  | 'ease'
  | 'mask';

export interface MotionTextEffectSettingChange {
  property: MotionTextEffectSettingProperty;
  value: MotionValue;
}

type MotionTextEffectSettings = Record<string, MotionValue> | null;

const SETTINGS_STYLES = `
  :host {
    display: block;
  }

  :host .ngs-motion-text-effect-settings__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--ngs-spacing-2, 8px);
  }

  :host .ngs-motion-text-effect-settings__grid.is-compact {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const readNumberSetting = (
  effect: MotionTextEffectSettings,
  property: MotionTextEffectSettingProperty,
  fallback: number,
): number => {
  const value = effect?.[property];
  const numberValue = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const readStringSetting = (
  effect: MotionTextEffectSettings,
  property: MotionTextEffectSettingProperty,
  fallback: string,
): string => {
  const value = effect?.[property];

  return typeof value === 'string' && value ? value : fallback;
};

@Directive()
abstract class MotionTextEffectSettingsBase {
  readonly effect = input<MotionTextEffectSettings>(null);
  readonly settingChange = output<MotionTextEffectSettingChange>();

  protected number(property: MotionTextEffectSettingProperty, fallback: number): number {
    return readNumberSetting(this.effect(), property, fallback);
  }

  protected string(property: MotionTextEffectSettingProperty, fallback: string): string {
    return readStringSetting(this.effect(), property, fallback);
  }

  protected setNumber(property: MotionTextEffectSettingProperty, value: unknown): void {
    const nextValue = Math.max(0, Number(value));

    this.settingChange.emit({
      property,
      value: Number.isFinite(nextValue) ? nextValue : 0,
    });
  }

  protected setString(property: MotionTextEffectSettingProperty, value: string): void {
    this.settingChange.emit({ property, value });
  }
}

@Component({
  selector: 'ngs-motion-chars-slide-up-settings',
  imports: [FormField, Input, Label],
  template: `
    <div class="ngs-motion-text-effect-settings__grid">
      <ngs-form-field subscriptHiddenIfEmpty>
        <ngs-label>Duration</ngs-label>
        <input
          ngsInput
          type="number"
          min="100"
          step="50"
          [value]="number('duration', 620)"
          (input)="setNumber('duration', $any($event.target).value)"
        />
      </ngs-form-field>
      <ngs-form-field subscriptHiddenIfEmpty>
        <ngs-label>Character stagger</ngs-label>
        <input
          ngsInput
          type="number"
          min="0"
          step="5"
          [value]="number('stagger', 24)"
          (input)="setNumber('stagger', $any($event.target).value)"
        />
      </ngs-form-field>
      <ngs-form-field subscriptHiddenIfEmpty>
        <ngs-label>Slide distance</ngs-label>
        <input
          ngsInput
          type="number"
          min="0"
          step="4"
          [value]="number('distance', 44)"
          (input)="setNumber('distance', $any($event.target).value)"
        />
      </ngs-form-field>
    </div>
  `,
  styles: [SETTINGS_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotionCharsSlideUpSettings extends MotionTextEffectSettingsBase {}

@Component({
  selector: 'ngs-motion-words-fade-up-settings',
  imports: [FormField, Input, Label],
  template: `
    <div class="ngs-motion-text-effect-settings__grid">
      <ngs-form-field subscriptHiddenIfEmpty>
        <ngs-label>Duration</ngs-label>
        <input
          ngsInput
          type="number"
          min="100"
          step="50"
          [value]="number('duration', 560)"
          (input)="setNumber('duration', $any($event.target).value)"
        />
      </ngs-form-field>
      <ngs-form-field subscriptHiddenIfEmpty>
        <ngs-label>Word stagger</ngs-label>
        <input
          ngsInput
          type="number"
          min="0"
          step="10"
          [value]="number('stagger', 70)"
          (input)="setNumber('stagger', $any($event.target).value)"
        />
      </ngs-form-field>
      <ngs-form-field subscriptHiddenIfEmpty>
        <ngs-label>Rise distance</ngs-label>
        <input
          ngsInput
          type="number"
          min="0"
          step="4"
          [value]="number('distance', 42)"
          (input)="setNumber('distance', $any($event.target).value)"
        />
      </ngs-form-field>
    </div>
  `,
  styles: [SETTINGS_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotionWordsFadeUpSettings extends MotionTextEffectSettingsBase {}

@Component({
  selector: 'ngs-motion-prepare-text-words-settings',
  imports: [FormField, Input, Label],
  template: `
    <div class="ngs-motion-text-effect-settings__grid">
      <ngs-form-field subscriptHiddenIfEmpty>
        <ngs-label>Duration</ngs-label>
        <input
          ngsInput
          type="number"
          min="100"
          step="50"
          [value]="number('duration', 600)"
          (input)="setNumber('duration', $any($event.target).value)"
        />
      </ngs-form-field>
      <ngs-form-field subscriptHiddenIfEmpty>
        <ngs-label>Segment stagger</ngs-label>
        <input
          ngsInput
          type="number"
          min="0"
          step="10"
          [value]="number('stagger', 100)"
          (input)="setNumber('stagger', $any($event.target).value)"
        />
      </ngs-form-field>
      <ngs-form-field subscriptHiddenIfEmpty>
        <ngs-label>Rise distance</ngs-label>
        <input
          ngsInput
          type="number"
          min="0"
          step="5"
          [value]="number('distance', 50)"
          (input)="setNumber('distance', $any($event.target).value)"
        />
      </ngs-form-field>
    </div>
  `,
  styles: [SETTINGS_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotionPrepareTextWordsSettings extends MotionTextEffectSettingsBase {}

@Component({
  selector: 'ngs-motion-masked-letters-settings',
  imports: [FormField, Input, Label, Option, Select],
  template: `
    <div class="ngs-motion-text-effect-settings__grid">
      <ngs-form-field subscriptHiddenIfEmpty>
        <ngs-label>Duration</ngs-label>
        <input
          ngsInput
          type="number"
          min="100"
          step="50"
          [value]="number('duration', 600)"
          (input)="setNumber('duration', $any($event.target).value)"
        />
      </ngs-form-field>
      <ngs-form-field subscriptHiddenIfEmpty>
        <ngs-label>Random window</ngs-label>
        <input
          ngsInput
          type="number"
          min="0"
          step="50"
          [value]="number('stagger', 600)"
          (input)="setNumber('stagger', $any($event.target).value)"
        />
      </ngs-form-field>
      <ngs-form-field subscriptHiddenIfEmpty>
        <ngs-label>Scatter percent</ngs-label>
        <input
          ngsInput
          type="number"
          min="0"
          step="10"
          [value]="number('distance', 150)"
          (input)="setNumber('distance', $any($event.target).value)"
        />
      </ngs-form-field>
      <ngs-form-field subscriptHiddenIfEmpty>
        <ngs-label>Mask</ngs-label>
        <ngs-select
          [value]="string('mask', 'words')"
          (selectionChange)="setString('mask', $event.value)"
        >
          <ngs-option value="words">Words</ngs-option>
          <ngs-option value="chars">Characters</ngs-option>
        </ngs-select>
      </ngs-form-field>
    </div>
  `,
  styles: [SETTINGS_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotionMaskedLettersSettings extends MotionTextEffectSettingsBase {}

@Component({
  selector: 'ngs-motion-chars-blur-in-settings',
  imports: [FormField, Input, Label],
  template: `
    <div class="ngs-motion-text-effect-settings__grid is-compact">
      <ngs-form-field subscriptHiddenIfEmpty>
        <ngs-label>Duration</ngs-label>
        <input
          ngsInput
          type="number"
          min="100"
          step="50"
          [value]="number('duration', 520)"
          (input)="setNumber('duration', $any($event.target).value)"
        />
      </ngs-form-field>
      <ngs-form-field subscriptHiddenIfEmpty>
        <ngs-label>Character stagger</ngs-label>
        <input
          ngsInput
          type="number"
          min="0"
          step="5"
          [value]="number('stagger', 18)"
          (input)="setNumber('stagger', $any($event.target).value)"
        />
      </ngs-form-field>
    </div>
  `,
  styles: [SETTINGS_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotionCharsBlurInSettings extends MotionTextEffectSettingsBase {}

@Component({
  selector: 'ngs-motion-lines-mask-up-settings',
  imports: [FormField, Input, Label],
  template: `
    <div class="ngs-motion-text-effect-settings__grid">
      <ngs-form-field subscriptHiddenIfEmpty>
        <ngs-label>Duration</ngs-label>
        <input
          ngsInput
          type="number"
          min="100"
          step="50"
          [value]="number('duration', 720)"
          (input)="setNumber('duration', $any($event.target).value)"
        />
      </ngs-form-field>
      <ngs-form-field subscriptHiddenIfEmpty>
        <ngs-label>Line stagger</ngs-label>
        <input
          ngsInput
          type="number"
          min="0"
          step="10"
          [value]="number('stagger', 110)"
          (input)="setNumber('stagger', $any($event.target).value)"
        />
      </ngs-form-field>
      <ngs-form-field subscriptHiddenIfEmpty>
        <ngs-label>Mask distance</ngs-label>
        <input
          ngsInput
          type="number"
          min="0"
          step="4"
          [value]="number('distance', 58)"
          (input)="setNumber('distance', $any($event.target).value)"
        />
      </ngs-form-field>
    </div>
  `,
  styles: [SETTINGS_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotionLinesMaskUpSettings extends MotionTextEffectSettingsBase {}

@Component({
  selector: 'ngs-motion-chars-scale-pop-settings',
  imports: [FormField, Input, Label],
  template: `
    <div class="ngs-motion-text-effect-settings__grid is-compact">
      <ngs-form-field subscriptHiddenIfEmpty>
        <ngs-label>Duration</ngs-label>
        <input
          ngsInput
          type="number"
          min="100"
          step="50"
          [value]="number('duration', 540)"
          (input)="setNumber('duration', $any($event.target).value)"
        />
      </ngs-form-field>
      <ngs-form-field subscriptHiddenIfEmpty>
        <ngs-label>Character stagger</ngs-label>
        <input
          ngsInput
          type="number"
          min="0"
          step="5"
          [value]="number('stagger', 22)"
          (input)="setNumber('stagger', $any($event.target).value)"
        />
      </ngs-form-field>
    </div>
  `,
  styles: [SETTINGS_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotionCharsScalePopSettings extends MotionTextEffectSettingsBase {}
