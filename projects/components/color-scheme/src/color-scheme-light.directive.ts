import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsColorSchemeLight]'
})
export class ColorSchemeLightDirective {
  readonly templateRef = inject(TemplateRef);
}
