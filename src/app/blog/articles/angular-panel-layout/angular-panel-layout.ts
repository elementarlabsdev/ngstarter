import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@ngstarter-ui/components/button';
import { Card, CardContent } from '@ngstarter-ui/components/card';
import { Chip, ChipSet } from '@ngstarter-ui/components/chips';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  ScrollSpyBackToTop,
  ScrollSpyNav,
  ScrollSpyOn,
  ScrollSpyTitle,
} from '@ngstarter-ui/components/scroll-spy';

@Component({
  selector: 'app-angular-panel-layout',
  imports: [
    Button,
    Card,
    CardContent,
    Chip,
    ChipSet,
    CodeHighlighter,
    Icon,
    RouterLink,
    ScrollSpyBackToTop,
    ScrollSpyNav,
    ScrollSpyOn,
    ScrollSpyTitle,
  ],
  templateUrl: './angular-panel-layout.html',
  styleUrl: './angular-panel-layout.scss',
})
export class AngularPanelLayout {
  readonly importCode = `import {
  Panel,
  PanelAside,
  PanelContent,
  PanelFooter,
  PanelHeader,
  PanelSidebar,
  PanelSubheader,
} from '@ngstarter-ui/components/panel';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { Toolbar, ToolbarSpacer, ToolbarTitle } from '@ngstarter-ui/components/toolbar';`;

  readonly singleWorkspaceCode = `<ngs-panel>
  <ngs-panel-header>
    <ngs-toolbar>
      <ngs-toolbar-title>Customers</ngs-toolbar-title>
      <ngs-toolbar-spacer />
      <button ngsButton="filled">New customer</button>
    </ngs-toolbar>
  </ngs-panel-header>

  <ngs-panel-content>
    <ngs-scrollbar-area>
      <div class="p-6">
        <!-- DataView, cards, tables, or route content go here. -->
      </div>
    </ngs-scrollbar-area>
  </ngs-panel-content>
</ngs-panel>`;

  readonly headerFooterCode = `<ngs-panel>
  <ngs-panel-header>
    <ngs-toolbar>
      <ngs-toolbar-title>Invoice editor</ngs-toolbar-title>
      <ngs-toolbar-spacer />
      <button ngsButton="outlined">Preview</button>
    </ngs-toolbar>
  </ngs-panel-header>

  <ngs-panel-content>
    <ngs-scrollbar-area>
      <div class="p-6">
        <!-- Long editable form sections. -->
      </div>
    </ngs-scrollbar-area>
  </ngs-panel-content>

  <ngs-panel-footer class="flex items-center justify-end gap-3 px-6">
    <button ngsButton="text">Cancel</button>
    <button ngsButton="filled">Save invoice</button>
  </ngs-panel-footer>
</ngs-panel>`;

  readonly masterDetailCode = `<ngs-panel>
  <ngs-panel-header>
    <ngs-toolbar>
      <ngs-toolbar-title>Opportunities</ngs-toolbar-title>
      <ngs-toolbar-spacer />
      <button ngsButton="outlined">Filter</button>
    </ngs-toolbar>
  </ngs-panel-header>

  <ngs-panel-sidebar class="w-80 border-r border-border">
    <ngs-scrollbar-area>
      <div class="p-4">
        <!-- SelectionList or compact record list. -->
      </div>
    </ngs-scrollbar-area>
  </ngs-panel-sidebar>

  <ngs-panel-content>
    <ngs-scrollbar-area>
      <div class="p-6">
        <!-- Selected record overview, tabs, and activity. -->
      </div>
    </ngs-scrollbar-area>
  </ngs-panel-content>
</ngs-panel>`;

  readonly inspectorCode = `<ngs-panel>
  <ngs-panel-header>
    <ngs-toolbar>
      <ngs-toolbar-title>Campaign performance</ngs-toolbar-title>
      <ngs-toolbar-spacer />
      <button ngsButton="outlined">Export</button>
    </ngs-toolbar>
  </ngs-panel-header>

  <ngs-panel-content>
    <ngs-scrollbar-area>
      <div class="grid gap-6 p-6 xl:grid-cols-3">
        <!-- KPI cards, charts, and supporting tables. -->
      </div>
    </ngs-scrollbar-area>
  </ngs-panel-content>

  <ngs-panel-aside class="w-80 border-l border-border">
    <ngs-scrollbar-area>
      <div class="p-5">
        <!-- Persistent insights, comments, or audit trail. -->
      </div>
    </ngs-scrollbar-area>
  </ngs-panel-aside>
</ngs-panel>`;

  readonly complexWorkspaceCode = `<ngs-panel>
  <ngs-panel-header>
    <ngs-toolbar>
      <ngs-toolbar-title>Settings</ngs-toolbar-title>
      <ngs-toolbar-spacer />
      <button ngsButton="filled">Save changes</button>
    </ngs-toolbar>
  </ngs-panel-header>

  <ngs-panel-subheader class="px-6">
    <p class="text-sm text-on-surface-variant">
      Manage workspace defaults, billing rules, and security preferences.
    </p>
  </ngs-panel-subheader>

  <ngs-panel-sidebar class="w-72 border-r border-border">
    <ngs-scrollbar-area>
      <div class="p-4">
        <!-- Secondary settings navigation. -->
      </div>
    </ngs-scrollbar-area>
  </ngs-panel-sidebar>

  <ngs-panel-content>
    <ngs-scrollbar-area>
      <div class="mx-auto max-w-3xl p-6">
        <!-- One form section per card or panel group. -->
      </div>
    </ngs-scrollbar-area>
  </ngs-panel-content>

  <ngs-panel-aside class="w-80 border-l border-border">
    <div class="p-5">
      <!-- Help, policy notes, or required actions. -->
    </div>
  </ngs-panel-aside>
</ngs-panel>`;

  readonly sizingCode = `@reference 'tailwindcss';

:host {
  display: block;
  height: 100%;

  ngs-panel {
    height: 100%;
  }

  .workspace-note {
    color: var(--ngs-color-on-surface-variant);
    font-size: 0.875rem;
    line-height: 1.6;
  }
}`;
}
