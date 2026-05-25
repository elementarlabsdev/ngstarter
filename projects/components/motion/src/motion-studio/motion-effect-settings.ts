import { ChangeDetectionStrategy, Component, Directive, input, output } from '@angular/core';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Option, Select } from '@ngstarter-ui/components/select';

import { MotionAnimation, MotionEasingName } from '../schema/motion-document';

export interface MotionEffectSettingChange {
  property: 'easing';
  value: MotionEasingName;
}

type MotionEffectEasingOption = {
  label: string;
  value: MotionEasingName;
};

const SETTINGS_STYLES = `
  :host {
    display: block;
  }

  :host .ngs-motion-effect-settings__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--ngs-spacing-2, 8px);
  }
`;

const EFFECT_EASING_TEMPLATE = `
  <div class="ngs-motion-effect-settings__grid">
    <ngs-form-field subscriptHiddenIfEmpty>
      <ngs-label>Easing</ngs-label>
      <ngs-select [value]="easing()" (selectionChange)="setEasing($event.value)">
        @for (option of easingOptions(); track option.value) {
          <ngs-option [value]="option.value">{{ option.label }}</ngs-option>
        }
      </ngs-select>
    </ngs-form-field>
  </div>
`;

@Directive()
abstract class MotionEffectSettingsBase {
  readonly animation = input<MotionAnimation | null>(null);
  readonly easingOptions = input<MotionEffectEasingOption[]>([]);
  readonly settingChangeHandler = input<((change: MotionEffectSettingChange) => void) | null>(
    null,
  );
  readonly settingChange = output<MotionEffectSettingChange>();

  protected easing(): MotionEasingName {
    return this.animation()?.easing ?? 'linear';
  }

  protected setEasing(value: string): void {
    const nextValue = value as MotionEasingName;
    const change: MotionEffectSettingChange = {
      property: 'easing',
      value: nextValue,
    };

    this.settingChange.emit(change);
    this.settingChangeHandler()?.(change);
  }
}

@Component({
  selector: 'ngs-motion-fade-in-settings',
  imports: [FormField, Label, Option, Select],
  template: EFFECT_EASING_TEMPLATE,
  styles: [SETTINGS_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotionFadeInSettings extends MotionEffectSettingsBase {}

@Component({
  selector: 'ngs-motion-fade-out-settings',
  imports: [FormField, Label, Option, Select],
  template: EFFECT_EASING_TEMPLATE,
  styles: [SETTINGS_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotionFadeOutSettings extends MotionEffectSettingsBase {}

@Component({
  selector: 'ngs-motion-slide-x-settings',
  imports: [FormField, Label, Option, Select],
  template: EFFECT_EASING_TEMPLATE,
  styles: [SETTINGS_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotionSlideXSettings extends MotionEffectSettingsBase {}

@Component({
  selector: 'ngs-motion-slide-y-settings',
  imports: [FormField, Label, Option, Select],
  template: EFFECT_EASING_TEMPLATE,
  styles: [SETTINGS_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotionSlideYSettings extends MotionEffectSettingsBase {}

@Component({
  selector: 'ngs-motion-scale-settings',
  imports: [FormField, Label, Option, Select],
  template: EFFECT_EASING_TEMPLATE,
  styles: [SETTINGS_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotionScaleSettings extends MotionEffectSettingsBase {}

@Component({
  selector: 'ngs-motion-pulse-settings',
  imports: [FormField, Label, Option, Select],
  template: EFFECT_EASING_TEMPLATE,
  styles: [SETTINGS_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotionPulseSettings extends MotionEffectSettingsBase {}

@Component({
  selector: 'ngs-motion-rotate-settings',
  imports: [FormField, Label, Option, Select],
  template: EFFECT_EASING_TEMPLATE,
  styles: [SETTINGS_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotionRotateSettings extends MotionEffectSettingsBase {}

@Component({
  selector: 'ngs-motion-property-effect-settings',
  imports: [FormField, Label, Option, Select],
  template: EFFECT_EASING_TEMPLATE,
  styles: [SETTINGS_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotionPropertyEffectSettings extends MotionEffectSettingsBase {}
