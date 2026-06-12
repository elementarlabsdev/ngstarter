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
  selector: 'app-basic-application-layout',
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
  templateUrl: './basic-application-layout.html',
  styleUrl: './basic-application-layout.scss',
})
export class BasicApplicationLayout {
  readonly themeCode = `@use '@ngstarter-ui/components/styles/themes/default';`;

  readonly appConfigCode = `import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNgsTheme } from '@ngstarter-ui/components/core';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideNgsTheme({
      theme: 'modern',
      colorScheme: 'auto',
      density: 'compact',
      radius: 'small',
      primaryColor: '#155eef',
    }),
  ],
};`;

  readonly shellTsCode = `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { Layout, LayoutContent } from '@ngstarter-ui/components/layout';
import { Panel, PanelContent, PanelHeader } from '@ngstarter-ui/components/panel';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import {
  Sidebar,
  SidebarBody,
  SidebarHeader,
  SidebarNav,
  SidebarNavItem,
  SidebarNavItemIconDirective,
} from '@ngstarter-ui/components/sidebar';
import {
  Sidenav,
  SidenavContainer,
  SidenavContent,
} from '@ngstarter-ui/components/sidenav';
import { Toolbar, ToolbarSpacer, ToolbarTitle } from '@ngstarter-ui/components/toolbar';

@Component({
  selector: 'app-shell',
  imports: [
    Button,
    Icon,
    Layout,
    LayoutContent,
    Panel,
    PanelContent,
    PanelHeader,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    ScrollbarArea,
    Sidebar,
    SidebarBody,
    SidebarHeader,
    SidebarNav,
    SidebarNavItem,
    SidebarNavItemIconDirective,
    Sidenav,
    SidenavContainer,
    SidenavContent,
    Toolbar,
    ToolbarSpacer,
    ToolbarTitle,
  ],
  templateUrl: './app-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShell {
  readonly navItems = [
    { label: 'Dashboard', icon: 'fluent:home-24-regular', href: '/dashboard' },
    { label: 'Customers', icon: 'fluent:people-24-regular', href: '/customers' },
    { label: 'Reports', icon: 'fluent:chart-multiple-24-regular', href: '/reports' },
  ];
}`;

  readonly shellHtmlCode = `<ngs-layout root>
  <ngs-layout-content>
    <ngs-sidenav-container>
      <ngs-sidenav>
        <ngs-sidebar>
          <ngs-sidebar-header>
            <a class="brand-link" routerLink="/">
              <ngs-icon name="fluent:cube-24-filled" />
              <span>Acme Admin</span>
            </a>
          </ngs-sidebar-header>

          <ngs-sidebar-body>
            <ngs-sidebar-nav>
              @for (item of navItems; track item.href) {
                <a
                  ngs-sidebar-nav-item
                  [routerLink]="item.href"
                  routerLinkActive="is-active"
                >
                  <ngs-icon ngsSidebarNavItemIcon [name]="item.icon" />
                  {{ item.label }}
                </a>
              }
            </ngs-sidebar-nav>
          </ngs-sidebar-body>
        </ngs-sidebar>
      </ngs-sidenav>

      <ngs-sidenav-content>
        <ngs-panel>
          <ngs-panel-header>
            <ngs-toolbar>
              <ngs-toolbar-title>Dashboard</ngs-toolbar-title>
              <ngs-toolbar-spacer />
              <button ngsButton="outlined">Invite user</button>
            </ngs-toolbar>
          </ngs-panel-header>

          <ngs-panel-content>
            <ngs-scrollbar-area>
              <div class="workspace-content">
                <router-outlet />
              </div>
            </ngs-scrollbar-area>
          </ngs-panel-content>
        </ngs-panel>
      </ngs-sidenav-content>
    </ngs-sidenav-container>
  </ngs-layout-content>
</ngs-layout>`;

  readonly globalStylesCode = `@use '@ngstarter-ui/components/styles/themes/default';

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--ngs-color-on-surface);
  font-weight: 650;
  text-decoration: none;

  ngs-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: var(--ngs-color-primary);
  }
}

.workspace-content {
  padding: 1.5rem;
}

ngs-panel {
  height: 100%;
}`;

  readonly routeCode = `import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./app-shell').then((c) => c.AppShell),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then((c) => c.Dashboard),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
    ],
  },
];`;
}
