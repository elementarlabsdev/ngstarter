import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  input,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { TAB_CONTENT, TAB_LABEL } from './tab-directives';
import { TemplatePortal } from '@angular/cdk/portal';

@Component({
  selector: 'ngs-tab',
  exportAs: 'ngsTab',
  templateUrl: './tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-tab',
  }
})
export class Tab {
  templateLabel = contentChild(TAB_LABEL);
  explicitContent = contentChild(TAB_CONTENT);
  implicitContent = viewChild(TemplateRef);

  label = input('');
  ariaLabel = input('', { alias: 'aria-label' });
  ariaLabelledby = input('', { alias: 'aria-labelledby' });
  disabled = input(false, { transform: booleanAttribute });

  private _contentPortal: TemplatePortal | null = null;

  _prepareContent(viewContainerRef: any) {
    if (!this._contentPortal) {
      const template = this.explicitContent()?.template || this.implicitContent();

      if (template) {
        this._contentPortal = new TemplatePortal(
          template,
          viewContainerRef
        );
      }
    }
    return this._contentPortal;
  }
}
