import { booleanAttribute, Component, contentChild, input } from '@angular/core';
import { PanelSidebar } from '../panel-sidebar/panel-sidebar';
import { PanelAside } from '../panel-aside/panel-aside';
import { PanelHeader } from '../panel-header/panel-header';
import { PanelSubheader } from '../panel-subheader/panel-subheader';
import { PanelFooter } from '../panel-footer/panel-footer';

@Component({
  selector: 'ngs-panel',
  exportAs: 'ngsPanel',
  templateUrl: './panel.html',
  styleUrl: './panel.scss',
  host: {
    'class': 'ngs-panel',
    '[class.is-absolute]': 'absolute()',
    '[class.has-header]': 'header()',
    '[class.has-subheader]': 'subheader()',
    '[class.has-sidebar]': 'sidebar()',
    '[class.has-aside]': 'aside()',
    '[class.has-footer]': 'footer()'
  }
})
export class Panel {
  header = contentChild(PanelHeader);
  subheader = contentChild(PanelSubheader);
  sidebar = contentChild(PanelSidebar);
  aside = contentChild(PanelAside);
  footer = contentChild(PanelFooter);

  absolute = input(false, {
    transform: booleanAttribute
  });
}
