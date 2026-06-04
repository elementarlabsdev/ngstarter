import { afterNextRender, Component, inject, model, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { PageLoadingBar } from '@ngstarter-ui/components/page-loading-bar';
import {
  AnalyticsService, EnvironmentService, OrderByPipe,
  SeoService, SoundEffectDirective,
} from '@ngstarter-ui/components/core';
import { AnnouncementGlobal } from '@ngstarter-ui/components/announcement';
import { IncidentsContainer } from '@ngstarter-ui/components/incidents';
import {
  LayoutContent,
  Layout, LayoutHeader,
  LayoutTopbar
} from '@ngstarter-ui/components/layout';
import { Icon } from '@ngstarter-ui/components/icon';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import { Logo, LogoDescription, LogoShape, LogoText } from '@ngstarter-ui/components/logo';
import { SplashScreen } from '@ngstarter-ui/components/splash-screen';
import {
  ColorScheme,
  ColorSchemeAutoDirective,
  ColorSchemeDarkDirective,
  ColorSchemeLightDirective,
  ColorSchemeSwitcher,
} from '@ngstarter-ui/components/color-scheme';
import { Button } from '@ngstarter-ui/components/button';
import {
  Sidenav,
  SidenavCollapsed,
  SidenavContainer,
  SidenavContent,
  SidenavExpanded
} from '@ngstarter-ui/components/sidenav';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';
import { v7 as uuid } from 'uuid';
import {
  SidebarBody,
  Sidebar,
  SidebarHeader,
  SidebarNav, SidebarNavGroup, SidebarNavGroupMenu, SidebarNavGroupToggle,
  SidebarNavGroupToggleIconDirective, SidebarNavHeading, SidebarNavItemBadgeDirective, SidebarNavItem,
  SidebarNavItemDefDirective,
  SidebarNavItemIconDirective
} from '@ngstarter-ui/components/sidebar';
import { Location } from '@angular/common';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { FormsModule } from '@angular/forms';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import {Toolbar, ToolbarItem, ToolbarNav, ToolbarNavLink, ToolbarSpacer} from '@ngstarter-ui/components/toolbar';
import { DocsNavigationService } from './navigation/docs-navigation.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    PageLoadingBar,
    AnnouncementGlobal,
    IncidentsContainer,
    LayoutContent,
    Layout,
    LayoutTopbar,
    Sidebar,
    Icon,
    Tooltip,
    RouterLink,
    Logo,
    ColorSchemeSwitcher,
    ColorSchemeLightDirective,
    ColorSchemeDarkDirective,
    ColorSchemeAutoDirective,
    SoundEffectDirective,
    Button,
    Sidenav,
    SidenavContainer,
    SidenavContent,
    PanelContent,
    PanelHeader,
    Panel,
    OrderByPipe,
    SidebarBody,
    Sidebar,
    SidebarHeader,
    SidebarNav,
    SidebarNavGroup,
    SidebarNavGroupMenu,
    SidebarNavGroupToggle,
    SidebarNavGroupToggleIconDirective,
    SidebarNavHeading,
    SidebarNavItemBadgeDirective,
    SidebarNavItem,
    SidebarNavItemDefDirective,
    SidebarNavItemIconDirective,
    SlideToggle,
    FormsModule,
    ScrollbarArea,
    SidenavCollapsed,
    SidenavExpanded,
    LogoText,
    LogoShape,
    LogoDescription,
    SplashScreen,
    Toolbar,
    ToolbarSpacer,
    ToolbarItem,
    ToolbarNav,
    ToolbarNavLink,
    // SplashScreen,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private _analyticsService = inject(AnalyticsService);
  private _seoService = inject(SeoService);
  private _envService = inject(EnvironmentService);
  private _router = inject(Router);
  private readonly docsNavigation = inject(DocsNavigationService);

  router = inject(Router);
  location = inject(Location);
  height: string | null = '200px';
  compact = false;
  sidebarExpanded = model(true);
  opened = model(true);

  navItems: any[] = [
    {
      type: 'heading',
      name: 'Getting Started'
    },
    {
      type: 'link',
      name: 'Overview',
      key: 'overview',
      icon: 'fluent:globe-24-regular',
      link: '/'
    },
    {
      type: 'link',
      name: 'Installation',
      key: 'installation',
      icon: 'fluent:desktop-24-regular',
      link: '/installation'
    },
    {
      type: 'group',
      name: 'Theme',
      icon: 'fluent:options-24-regular',
      children: [
        {
          key: uuid(),
          type: 'link',
          name: 'Colors',
          link: '/theme/colors'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Typography',
          link: '/theme/typography'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Playground',
          link: '/theme/playground'
        },
        {
          key: 'theme-generator',
          type: 'link',
          name: 'Theme Generator',
          link: '/theme/generator'
        },
        {
          type: 'link',
          name: 'Customize Theme',
          key: 'customize',
          link: '/theme/customize'
        },
      ]
    },
    {
      type: 'heading',
      name: 'Forms'
    },
    {
      type: 'group',
      icon: 'fluent:news-24-regular',
      name: 'Basic Inputs',
      children: [
        {
          key: uuid(),
          type: 'link',
          name: 'Input',
          link: '/forms/input'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Buttons',
          link: '/forms/buttons'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Slide Toggle',
          link: '/forms/slide-toggle'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Checkbox',
          link: '/forms/checkbox'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Radio',
          link: '/forms/radio'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Segmented',
          link: '/forms/segmented'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Button Toggle',
          link: '/forms/button-toggle'
        },
      ]
    },
    {
      type: 'group',
      icon: 'fluent:multiselect-24-regular',
      name: 'Select',
      children: [
        {
          key: uuid(),
          type: 'link',
          name: 'Autocomplete',
          link: '/forms/autocomplete'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Filter Select',
          link: '/forms/filter-select'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Select',
          link: '/forms/select'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Timezone',
          link: '/forms/timezone'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Country Select',
          link: '/forms/country'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Currency Select',
          link: '/forms/currency-select'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Date Format Select',
          link: '/forms/date-format-select'
        },
      ]
    },
    {
      type: 'group',
      icon: 'fluent:checkbox-checked-24-regular',
      name: 'Custom Inputs',
      children: [
        {
          key: uuid(),
          type: 'link',
          name: 'Password Strength',
          link: '/forms/password-strength'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Pin Input',
          link: '/forms/pin-input'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Number Input',
          link: '/forms/number-input'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Phone Input',
          link: '/forms/phone-input'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Form Renderer',
          link: '/forms/form-renderer'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Inline Text Edit',
          link: '/forms/inline-text-edit'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Input Mask',
          link: '/forms/input-mask'
        },
      ]
    },
    {
      type: 'heading',
      name: 'Components'
    },
    {
      key: 'navigation',
      type: 'group',
      icon: 'fluent:navigation-24-regular',
      name: 'Navigation',
      children: [
        {
          key: uuid(),
          type: 'link',
          name: 'Sidebar',
          link: '/navigation/sidebar'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Navigation',
          link: '/navigation/navigation'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Breadcrumbs',
          link: '/navigation/breadcrumbs'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Tab Panel',
          link: '/navigation/tab-panel'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Rail Navigation',
          link: '/navigation/rail-nav'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Side Panel',
          link: '/navigation/side-panel'
        }
      ]
    },
    {
      type: 'group',
      icon: 'fluent:grid-24-regular',
      name: 'Components',
      badge: 76,
      children: [
        {
          key: uuid(),
          type: 'link',
          name: 'Action Required',
          link: '/components/action-required'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Alert',
          link: '/components/alert'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Bottom Sheet',
          link: '/components/bottom-sheet'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Card',
          link: '/components/card'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Card Overlay',
          link: '/components/card-overlay'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Digit Roller',
          link: '/components/digit-roller'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Carousel',
          link: '/components/carousel'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Cookie Popup',
          link: '/components/cookie-popup'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Crop',
          link: '/components/crop'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Code Highlighter',
          link: '/components/code-highlighter'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Grid',
          link: '/components/grid'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Incidents',
          link: '/components/incidents'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Expand',
          link: '/components/expand'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Content Fade',
          link: '/components/content-fade'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Icon',
          link: '/components/icon'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Emoji Picker',
          link: '/components/emoji-picker'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Badge',
          link: '/components/badge'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Avatar',
          link: '/components/avatar'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Empty State',
          link: '/components/empty-state'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Chips',
          link: '/components/chips'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Calendar',
          link: '/components/calendar'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Datepicker',
          link: '/components/datepicker'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Keyboard',
          link: '/components/kbd'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Timepicker',
          link: '/components/timepicker'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Tabs',
          link: '/components/tabs'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Menu',
          link: '/components/menu'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Paginator',
          link: '/components/paginator'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Popover',
          link: '/components/popover'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Tooltip',
          link: '/components/tooltip'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Gauge',
          link: '/components/gauge'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Guided Tour',
          link: '/components/guided-tour'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Slider',
          link: '/components/slider'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Table',
          link: '/components/table'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Sort',
          link: '/components/sort'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Timeline',
          link: '/components/timeline'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Dialog',
          link: '/components/dialog'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Upload',
          link: '/components/upload'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Panel',
          link: '/components/panel'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Resizable Container',
          link: '/components/resizable-container'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Snackbar',
          link: '/components/snackbar'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Command Bar',
          link: '/components/command-bar'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Color Picker',
          link: '/components/color-picker'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Color Switcher',
          link: '/components/color-switcher'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Divider',
          link: '/components/divider'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Skeleton',
          link: '/components/skeleton'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Filter Builder',
          link: '/components/filter-builder'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Expansion Panel',
          link: '/components/expansion-panel'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'List',
          link: '/components/list'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Progress Bar',
          link: '/components/progress-bar'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Progress Spinner',
          link: '/components/progress-spinner'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Stepper',
          link: '/components/stepper'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Step Tracker',
          link: '/components/step-tracker'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Headless Stepper',
          link: '/components/headless-stepper'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Tree',
          link: '/components/tree'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Layout',
          link: '/components/layout'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Suggestions',
          link: '/components/suggestions'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Announcement',
          link: '/components/announcement'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Marquee',
          link: '/components/marquee'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Confirm',
          link: '/components/confirm'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Thumbnail Maker',
          link: '/components/thumbnail-maker'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Image Placeholder',
          link: '/components/image-placeholder'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Image Viewer',
          link: '/components/image-viewer'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Video Viewer',
          link: '/components/video-viewer'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Image Zoom Viewer',
          link: '/components/image-zoom-viewer'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Image Resizer',
          link: '/components/image-resizer'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Comment Editor',
          link: '/components/comment-editor'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Text Editor',
          link: '/components/text-editor'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Screen Loader',
          link: '/components/screen-loader'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Sidenav',
          link: '/components/sidenav'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Drawer',
          link: '/components/drawer'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Comparison Slider',
          link: '/components/comparison-slider'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Signature Pad',
          link: '/components/signature-pad'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Notifications',
          link: '/components/notifications'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Block Loader',
          link: '/components/block-loader'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Tiles',
          link: '/components/tiles'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Split Pane',
          link: '/components/split-pane'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Toolbar',
          link: '/components/toolbar'
        },
      ]
    },
    {
      type: 'group',
      icon: 'fluent:data-bar-vertical-20-regular',
      name: 'Micro Charts',
      children: [
        {
          key: uuid(),
          type: 'link',
          name: 'Line Chart',
          link: '/micro-charts/line-chart'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Bar Chart',
          link: '/micro-charts/bar-chart'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Pie Chart',
          link: '/micro-charts/pie-chart'
        }
      ]
    },
    {
      type: 'heading',
      name: 'Libraries'
    },
    {
      key: 'kanban-board',
      type: 'group',
      name: 'Kanban Board',
      icon: 'fluent:grid-kanban-20-regular',
      children: [
        {
          key: uuid(),
          type: 'link',
          name: 'Overview',
          link: '/libraries/kanban-board/overview'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Basic Example',
          link: '/libraries/kanban-board/basic-example'
        },
      ]
    },
    {
      key: 'image-designer',
      type: 'group',
      name: 'Image Designer',
      icon: 'fluent:image-edit-24-regular',
      children: [
        {
          key: uuid(),
          type: 'link',
          name: 'Overview',
          link: '/libraries/image-designer/overview'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Basic Example',
          link: '/libraries/image-designer/basic-example'
        },
      ]
    },
    {
      key: 'video-player',
      type: 'group',
      name: 'Video Player',
      icon: 'fluent:video-clip-24-regular',
      children: [
        {
          key: uuid(),
          type: 'link',
          name: 'Overview',
          link: '/libraries/video-player/overview'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Basic Example',
          link: '/libraries/video-player/basic-example'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Minimal Example',
          link: '/libraries/video-player/minimal-example'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Carousel Example',
          link: '/libraries/video-player/carousel-example'
        },
      ]
    },
    {
      key: 'visual-builder',
      type: 'group',
      name: 'Visual Builder',
      icon: 'fluent:form-24-regular',
      children: [
        {
          key: uuid(),
          type: 'link',
          name: 'Overview',
          link: '/libraries/visual-builder/overview'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Basic Example',
          link: '/libraries/visual-builder/basic-example'
        },
      ]
    },
    {
      key: 'content-editor',
      type: 'group',
      name: 'Content Editor',
      icon: 'fluent:content-view-24-regular',
      children: [
        {
          key: uuid(),
          type: 'link',
          name: 'Overview',
          link: '/libraries/content-editor/overview'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Content Builder',
          link: '/libraries/content-editor/content-builder'
        },
      ]
    },
    {
      key: 'data-view',
      type: 'group',
      name: 'Data View',
      icon: 'fluent:table-24-regular',
      children: [
        {
          key: uuid(),
          type: 'link',
          name: 'Overview',
          link: '/libraries/data-view'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Basic',
          link: '/libraries/data-view/basic-dataview'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'DataView Layout',
          link: '/libraries/data-view/dataview-layout'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'With selection',
          link: '/libraries/data-view/with-selection'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'With pagination',
          link: '/libraries/data-view/with-pagination'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Embedded',
          link: '/libraries/data-view/embedded'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'With sorting',
          link: '/libraries/data-view/with-sorting'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Resizable columns',
          link: '/libraries/data-view/resizable-columns'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Column settings',
          link: '/libraries/data-view/column-settings'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Column pinning',
          link: '/libraries/data-view/column-pinning'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Pinning and pagination',
          link: '/libraries/data-view/pinning-pagination'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Custom cell renderers',
          link: '/libraries/data-view/custom-cell-renderers'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'With action bar',
          link: '/libraries/data-view/with-action-bar'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Filter data',
          link: '/libraries/data-view/filter-data'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Loading state',
          link: '/libraries/data-view/loading-state'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Sticky columns',
          link: '/libraries/data-view/sticky-columns'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Server side',
          link: '/libraries/data-view/server-side'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Server side (empty state)',
          link: '/libraries/data-view/server-side-empty-state'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Custom empty state',
          link: '/libraries/data-view/custom-empty-state'
        },
        {
          key: uuid(),
          type: 'link',
          name: 'Refresh',
          link: '/libraries/data-view/refresh'
        },
      ]
    },
  ];
  navItemLinks: any[] = [];
  activeKey: null | string = null;

  private _activateLink() {
    const currentPath = this.location.path() || '/';
    const exactActiveLink = this.navItemLinks.find(navItem => navItem.link === currentPath);
    const activeLink = exactActiveLink ?? this.navItemLinks
      .filter(navItem => navItem.link !== '/' && currentPath.startsWith(`${navItem.link}/`))
      .sort((a, b) => b.link.length - a.link.length)[0];

    if (activeLink) {
      this.activeKey = activeLink.key;
    } else {
      this.activeKey = null;
    }
  }

  constructor() {
    this.docsNavigation.registerNavItems(this.navItems);

    afterNextRender(() => {
      this._router.events
        .pipe(
          filter((event): event is NavigationEnd => event instanceof NavigationEnd)
        )
        .subscribe((event) => {
          if (event.urlAfterRedirects.includes('#')) {
            return;
          }

          requestAnimationFrame(() => this.scrollPageToTop());
        })
      ;
    });
  }

  ngOnInit(): void {
    this._seoService.trackCanonicalChanges(this._envService.getValue('siteUrl'));
    this._analyticsService.trackPageViews();
    this.navItems.forEach(navItem => {
      this.navItemLinks.push(navItem);

      if (navItem.children) {
        this.navItemLinks = this.navItemLinks.concat(navItem.children);
      }
    });
    this._activateLink();
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this._activateLink();
      })
    ;
  }

  onColorSchemeChanged(colorScheme: ColorScheme) {
    console.log('color scheme: ', colorScheme);
    // save this color to backend
  }

  onSidebarOpenedChange(event: any) {
    console.log(event);
  }

  private scrollPageToTop(): void {
    const targets = new Set<HTMLElement>();
    const scrollingElement = document.scrollingElement;

    if (scrollingElement instanceof HTMLElement) {
      targets.add(scrollingElement);
    }

    document
      .querySelectorAll<HTMLElement>('ngs-sidenav-content, ngs-panel-content, .ngs-sidenav-content, .ngs-panel-content')
      .forEach((element) => targets.add(element));

    for (const target of targets) {
      target.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
      target.scrollTop = 0;
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    });
  }
}
