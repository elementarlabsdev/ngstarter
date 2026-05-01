import { inject, Injectable, Type } from '@angular/core';
import { FORM_RENDERER_FIELD_REGISTRY } from '../models/form-config.model';

export type ComponentImporter = () => Promise<Type<any>>;

@Injectable({
  providedIn: 'root',
})
export class ComponentRegistryService {
  private globalRegistry = inject(FORM_RENDERER_FIELD_REGISTRY, { optional: true });
  private componentMap = new Map<string, ComponentImporter>();

  constructor() {
    this.registerDefaultComponents();
  }

  private registerDefaultComponents(): void {
    this.componentMap.set('input', () =>
      import('../fields/input-field/input-field').then(c => c.InputField)
    );
    this.componentMap.set('textarea', () =>
      import('../fields/textarea-field/textarea-field')
        .then(c => c.TextareaField)
    );
    this.componentMap.set('select', () =>
      import('../fields/select-field/select-field')
        .then(c => c.SelectField)
    );
    this.componentMap.set('checkbox', () =>
      import('../fields/checkbox-field/checkbox-field')
        .then(c => c.CheckboxField)
    );
    this.componentMap.set('datepicker', () =>
      import('../fields/datepicker-field/datepicker-field')
        .then(c => c.DatepickerField)
    );
    this.componentMap.set('toggle', () =>
      import('../fields/toggle-field/toggle-field')
        .then(c => c.ToggleField)
    );
    this.componentMap.set('radioGroup', () =>
      import('../fields/radio-group-field/radio-group-field')
        .then(c => c.RadioGroupField)
    );
    this.componentMap.set('timezone', () =>
      import('../fields/timezone-field/timezone-field')
        .then(c => c.TimezoneField)
    );
    this.componentMap.set('image', () =>
      import('../content/image-content/image-content')
        .then(c => c.ImageContent));
    this.componentMap.set('text', () =>
      import('../content/text-content/text-content')
        .then(c => c.TextContent));
    this.componentMap.set('divider', () =>
      import('../content/divider-content/divider-content')
        .then(c => c.DividerContent));
    this.componentMap.set('autocompleteMany', () =>
      import('../fields/autocomplete-many-field/autocomplete-many-field')
        .then(c => c.AutocompleteManyField)
    );

    if (this.globalRegistry) {
      const globalRegistry = this.globalRegistry as any;
      Object.keys(globalRegistry).forEach(typeName => {
        this.componentMap.set(typeName, globalRegistry[typeName]);
      });
    }
  }

  getImporter(typeName: string): ComponentImporter | undefined {
    return this.componentMap.get(typeName);
  }
}
