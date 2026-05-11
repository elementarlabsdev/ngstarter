import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  inject,
  output,
  ViewContainerRef
} from '@angular/core';
import { ColorSchemeStore } from '../color-scheme.store';
import { CdkPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import { ColorSchemeLightDirective } from '../color-scheme-light.directive';
import { ColorSchemeDarkDirective } from '../color-scheme-dark.directive';
import { ColorScheme } from '../color-scheme.model';
import { Button } from '@ngstarter-ui/components/button';
import { ColorSchemeAutoDirective } from '../color-scheme-auto.directive';

@Component({
  selector: 'ngs-color-scheme-switcher',
  exportAs: 'ngsColorSchemeSwitcher',
  imports: [

    CdkPortalOutlet,
    Button,
  ],
  templateUrl: './color-scheme-switcher.html',
  styleUrl: './color-scheme-switcher.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-color-scheme-switcher',
    ngSkipHydration: 'true' // important! to prevent double render for icons
  }
})
export class ColorSchemeSwitcher {
  private store = inject(ColorSchemeStore);
  private viewContainerRef = inject(ViewContainerRef);

  private lightRef = contentChild(ColorSchemeLightDirective);
  private darkRef = contentChild(ColorSchemeDarkDirective);
  private autoRef = contentChild(ColorSchemeAutoDirective);

  readonly colorScheme = computed(() => this.store.theme());
  readonly resolvedColorScheme = computed(() => this.store.resolvedTheme());
  readonly colorSchemeChanged = output<ColorScheme>();

  protected portal: TemplatePortal<any> | null = null;

  constructor() {
    effect(() => {
      this.colorScheme();
      this.resolvedColorScheme();
      this.lightRef();
      this.darkRef();
      this.autoRef();
      this.setPortal();
    });
  }

  protected toggleScheme() {
    const order: ColorScheme[] = ['light', 'dark', 'auto'];
    const currentIndex = order.indexOf(this.store.theme());
    const newScheme = order[(currentIndex + 1) % order.length];
    this.store.setScheme(newScheme);
    this.setPortal();
    this.colorSchemeChanged.emit(this.store.theme());
  }

  private setPortal() {
    const lightRef = this.lightRef();
    const darkRef = this.darkRef();
    const autoRef = this.autoRef();

    if (this.colorScheme() === 'auto' && autoRef) {
      this.portal = new TemplatePortal(autoRef.templateRef, this.viewContainerRef);
    } else if (this.resolvedColorScheme() === 'light' && lightRef) {
      this.portal = new TemplatePortal(lightRef.templateRef, this.viewContainerRef);
    } else if (this.resolvedColorScheme() === 'dark' && darkRef) {
      this.portal = new TemplatePortal(darkRef.templateRef, this.viewContainerRef);
    }
  }
}
