import { inject, Injectable } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { EnvironmentService } from '@ngstarter-ui/components/core';

type SeoTitleConfig = {
  label: string;
  detail: string;
  kind?: string;
};

const COMPONENT_TITLES: Record<string, SeoTitleConfig> = {
  'action-required': { label: 'Action Required', detail: 'Required User Actions' },
  alert: { label: 'Alert', detail: 'Inline Status Messages' },
  announcement: { label: 'Announcement', detail: 'Product Updates and Notices' },
  avatar: { label: 'Avatar', detail: 'User Identity UI' },
  badge: { label: 'Badge', detail: 'Counters and Status Labels' },
  'block-loader': { label: 'Block Loader', detail: 'Scoped Loading States' },
  'bottom-sheet': { label: 'Bottom Sheet', detail: 'Mobile Action Panels' },
  card: { label: 'Card', detail: 'Content Containers' },
  'card-overlay': { label: 'Card Overlay', detail: 'Media Action Overlays' },
  carousel: { label: 'Carousel', detail: 'Content Sliders' },
  chips: { label: 'Chips', detail: 'Tags, Filters, and Selections' },
  'code-highlighter': { label: 'Code Highlighter', detail: 'Syntax Highlighted Code Blocks' },
  'color-picker': { label: 'Color Picker', detail: 'Color Selection UI' },
  'color-switcher': { label: 'Color Switcher', detail: 'Theme Color Controls' },
  'command-bar': { label: 'Command Bar', detail: 'Keyboard Commands' },
  'comment-editor': { label: 'Comment Editor', detail: 'Rich Comment Input' },
  'comparison-slider': { label: 'Comparison Slider', detail: 'Before and After Views' },
  confirm: { label: 'Confirm', detail: 'Confirmation Dialogs' },
  'content-fade': { label: 'Content Fade', detail: 'Scrollable Content Fades' },
  'cookie-popup': { label: 'Cookie Popup', detail: 'Consent Banners' },
  crop: { label: 'Crop', detail: 'Image Cropping' },
  datepicker: { label: 'Datepicker', detail: 'Date Selection' },
  dialog: { label: 'Dialog', detail: 'Modal Workflows' },
  divider: { label: 'Divider', detail: 'Section Separation' },
  drawer: { label: 'Drawer', detail: 'Temporary Side Panels' },
  'emoji-picker': { label: 'Emoji Picker', detail: 'Emoji Selection UI' },
  'empty-state': { label: 'Empty State', detail: 'Placeholder and Recovery States' },
  expand: { label: 'Expand', detail: 'Collapsible Content' },
  'expansion-panel': { label: 'Expansion Panel', detail: 'Disclosure UI' },
  'filter-builder': { label: 'Filter Builder', detail: 'Query Builder UI' },
  gauge: { label: 'Gauge', detail: 'KPI and Progress Metrics' },
  'guided-tour': { label: 'Guided Tour', detail: 'Product Onboarding' },
  grid: { label: 'Grid', detail: 'Responsive Layouts' },
  icon: { label: 'Icon', detail: 'Icon Rendering' },
  incidents: { label: 'Incidents', detail: 'Incident Status UI' },
  'image-placeholder': { label: 'Image Placeholder', detail: 'Media Placeholders' },
  'image-resizer': { label: 'Image Resizer', detail: 'Image Resizing' },
  'image-viewer': { label: 'Image Viewer', detail: 'Image Preview UI' },
  'image-zoom-viewer': { label: 'Image Zoom Viewer', detail: 'Zoomable Image Preview' },
  kbd: { label: 'Kbd', detail: 'Keyboard Shortcut Hints' },
  layout: { label: 'Layout', detail: 'App Shell Layouts' },
  list: { label: 'List', detail: 'Lists and Selection UI' },
  marquee: { label: 'Marquee', detail: 'Scrolling Content' },
  menu: { label: 'Menu', detail: 'Action Menus' },
  notifications: { label: 'Notifications', detail: 'Notification Feeds' },
  paginator: { label: 'Paginator', detail: 'Page Navigation' },
  panel: { label: 'Panel', detail: 'Workspace Layouts' },
  popover: { label: 'Popover', detail: 'Click & Hover Overlay' },
  'progress-bar': { label: 'Progress Bar', detail: 'Progress Feedback' },
  'progress-spinner': { label: 'Progress Spinner', detail: 'Loading States' },
  'resizable-container': { label: 'Resizable Container', detail: 'Resizable Layouts' },
  'screen-loader': { label: 'Screen Loader', detail: 'Full-screen Loading' },
  sidenav: { label: 'Sidenav', detail: 'App Navigation Shells' },
  'signature-pad': { label: 'Signature Pad', detail: 'Signature Capture' },
  skeleton: { label: 'Skeleton', detail: 'Loading Placeholders' },
  slider: { label: 'Slider', detail: 'Range Inputs' },
  snackbar: { label: 'Snackbar', detail: 'Toast Notifications' },
  'split-pane': { label: 'Split Pane', detail: 'Resizable Split Layouts' },
  stepper: { label: 'Stepper', detail: 'Multi-step Flows' },
  suggestions: { label: 'Suggestions', detail: 'Suggested Actions' },
  table: { label: 'Table', detail: 'Sorting, Filtering, Pagination' },
  tabs: { label: 'Tabs', detail: 'Tabbed Interfaces' },
  'text-editor': { label: 'Text Editor', detail: 'Rich Text Editing' },
  'thumbnail-maker': { label: 'Thumbnail Maker', detail: 'Media Thumbnails' },
  tiles: { label: 'Tiles', detail: 'Visual Tile Layouts' },
  timeline: { label: 'Timeline', detail: 'Activity History' },
  timepicker: { label: 'Timepicker', detail: 'Time Selection' },
  toolbar: { label: 'Toolbar', detail: 'Action Rows and Headers' },
  tooltip: { label: 'Tooltip', detail: 'Contextual Help' },
  tree: { label: 'Tree', detail: 'Hierarchical Data' },
  upload: { label: 'Upload', detail: 'File Uploads' },
  'video-viewer': { label: 'Video Viewer', detail: 'Video Preview UI' },
};

const FORM_TITLES: Record<string, SeoTitleConfig> = {
  autocomplete: { label: 'Autocomplete', detail: 'Search Suggestions and Selection' },
  'button-toggle': { label: 'Button Toggle', detail: 'Segmented Form Choices' },
  buttons: { label: 'Button', detail: 'Buttons and Icon Actions', kind: 'Components' },
  checkbox: { label: 'Checkbox', detail: 'Boolean Form Selection' },
  country: { label: 'Country Select', detail: 'Country Picker UI' },
  'currency-select': { label: 'Currency Select', detail: 'Currency Picker UI' },
  'date-format-select': { label: 'Date Format Select', detail: 'Locale Date Formats' },
  'form-renderer': { label: 'Form Renderer', detail: 'Schema-driven Forms' },
  input: { label: 'Input', detail: 'Text Fields and Form Controls' },
  'input-mask': { label: 'Input Mask', detail: 'Masked Form Values' },
  'input-validator': { label: 'Input Validator', detail: 'Validation Rules' },
  'inline-text-edit': { label: 'Inline Text Edit', detail: 'Editable Text UI' },
  'number-input': { label: 'Number Input', detail: 'Numeric Form Controls' },
  'password-strength': { label: 'Password Strength', detail: 'Password Validation Feedback' },
  'phone-input': { label: 'Phone Input', detail: 'International Phone Fields' },
  'pin-input': { label: 'Pin Input', detail: 'OTP & MFA Forms' },
  radio: { label: 'Radio', detail: 'Single-choice Form Controls' },
  segmented: { label: 'Segmented', detail: 'Segmented Choice Controls' },
  select: { label: 'Select', detail: 'Dropdown Selection UI' },
  'slide-toggle': { label: 'Slide Toggle', detail: 'Binary Switch Controls' },
  timezone: { label: 'Timezone Select', detail: 'Timezone Picker UI' },
};

const NAVIGATION_TITLES: Record<string, SeoTitleConfig> = {
  breadcrumbs: { label: 'Breadcrumbs', detail: 'Page Hierarchy Navigation' },
  navigation: { label: 'Navigation', detail: 'In-page Navigation UI' },
  'rail-nav': { label: 'Rail Navigation', detail: 'Compact Secondary Navigation' },
  sidebar: { label: 'Sidebar', detail: 'Admin App Navigation' },
  'side-panel': { label: 'Side Panel', detail: 'Persistent Inspector Panels' },
  'tab-panel': { label: 'Tab Panel', detail: 'Tabbed Workspace Layouts' },
};

const LIBRARY_TITLES: Record<string, SeoTitleConfig> = {
  'content-editor': { label: 'Content Editor', detail: 'Rich Content Editing' },
  'data-view': { label: 'Data View', detail: 'Data Grids and Operational Tables' },
  'image-designer': { label: 'Image Designer', detail: 'Visual Image Editing' },
  'kanban-board': { label: 'Kanban Board', detail: 'Workflow Boards' },
  'video-player': { label: 'Video Player', detail: 'Media Playback UI' },
  'visual-builder': { label: 'Visual Builder', detail: 'Drag and Drop UI Building' },
};

const DATA_VIEW_EXAMPLE_TITLES: Record<string, SeoTitleConfig> = {
  'basic-dataview': { label: 'Data View Basic', detail: 'Client-side Angular Data Grid' },
  'column-pinning': { label: 'Data View Column Pinning', detail: 'Pinned Columns for Wide Tables' },
  'column-settings': { label: 'Data View Column Settings', detail: 'Visibility, Order, and Pinning' },
  'custom-cell-renderers': { label: 'Data View Custom Cell Renderers', detail: 'Rich Angular Grid Cells' },
  'custom-empty-state': { label: 'Data View Custom Empty State', detail: 'No Data and No Results UI' },
  embedded: { label: 'Data View Embedded', detail: 'Compact Grids in Panels and Cards' },
  'filter-data': { label: 'Data View Filtering', detail: 'Search and Filtered Results' },
  'loading-state': { label: 'Data View Loading State', detail: 'Grid Loading and Refresh Feedback' },
  'pinning-pagination': { label: 'Data View Pinning and Pagination', detail: 'Wide Paginated Tables' },
  refresh: { label: 'Data View Refresh', detail: 'Client and Server Data Reloading' },
  'resizable-columns': { label: 'Data View Resizable Columns', detail: 'Adjustable Grid Column Widths' },
  'server-side-empty-state': { label: 'Data View Server-side Empty State', detail: 'Empty API Responses' },
  'server-side': { label: 'Data View Server-side', detail: 'Backend Pagination, Sorting, and Filtering' },
  'sticky-columns': { label: 'Data View Sticky Columns', detail: 'Horizontal Scrolling Tables' },
  'with-action-bar': { label: 'Data View Action Bar', detail: 'Row Actions for Admin Tables' },
  'with-pagination': { label: 'Data View Pagination', detail: 'Paged Angular Grid Records' },
  'with-selection': { label: 'Data View Selection', detail: 'Row Selection and Bulk Actions' },
  'with-sorting': { label: 'Data View Sorting', detail: 'Sortable Angular Grid Columns' },
};

const MICRO_CHART_TITLES: Record<string, SeoTitleConfig> = {
  'bar-chart': { label: 'Bar Chart', detail: 'Compact Comparisons' },
  'line-chart': { label: 'Line Chart', detail: 'Sparkline Trends' },
  'pie-chart': { label: 'Pie Chart', detail: 'Proportional Breakdowns' },
};

@Injectable({ providedIn: 'root' })
export class DocsTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly environment = inject(EnvironmentService);
  private readonly detailSeparator = ' \u2013 ';

  override updateTitle(routerState: RouterStateSnapshot): void {
    this.title.setTitle(this.resolveTitle(routerState));
  }

  private resolveTitle(routerState: RouterStateSnapshot): string {
    const segments = this.getPathSegments(routerState.url);
    const routeTitle = this.cleanTitle(this.buildTitle(routerState));

    if (segments.length === 0) {
      return this.withSiteTitle('Documentation', 'AI-Friendly Angular Components Library');
    }

    const [section, slug] = segments;
    const isApi = segments.includes('api');

    if (section === 'components') {
      return this.componentTitle(slug, isApi);
    }

    if (section === 'forms') {
      if (!slug) {
        return this.withSiteTitle('Angular Form Components', 'Inputs, Validation, and Controls');
      }

      return this.catalogTitle(slug, FORM_TITLES, 'Component', isApi);
    }

    if (section === 'navigation') {
      if (!slug) {
        return this.withSiteTitle('Angular Navigation Components', 'Sidebars, Tabs, and Breadcrumbs');
      }

      return this.catalogTitle(slug, NAVIGATION_TITLES, 'Component', isApi);
    }

    if (section === 'libraries') {
      if (!slug) {
        return this.withSiteTitle('Angular UI Libraries', 'Data Grids, Editors, and Builders');
      }

      if (slug === 'data-view' && segments[2] && segments[2] !== 'api') {
        return this.catalogTitle(segments[2], DATA_VIEW_EXAMPLE_TITLES, 'Example', false);
      }

      return this.catalogTitle(slug, LIBRARY_TITLES, 'Library', isApi);
    }

    if (section === 'micro-charts') {
      if (!slug) {
        return this.withSiteTitle('Angular Micro Chart Components', 'Compact Data Visualization');
      }

      return this.catalogTitle(slug, MICRO_CHART_TITLES, 'Component', isApi);
    }

    if (section === 'theme') {
      return this.themeTitle(slug);
    }

    if (section === 'installation') {
      return this.withSiteTitle('Install Angular Components Library', 'AI-Friendly Angular Components Library');
    }

    return this.withSiteTitle(routeTitle || this.toTitleCase(section), 'Angular UI Documentation');
  }

  private componentTitle(slug: string | undefined, isApi: boolean): string {
    if (!slug) {
      return this.withSiteTitle('Angular Components Documentation', 'AI-Friendly UI Library');
    }

    return this.catalogTitle(slug, COMPONENT_TITLES, 'Component', isApi);
  }

  private catalogTitle(
    slug: string | undefined,
    catalog: Record<string, SeoTitleConfig>,
    defaultKind: string,
    isApi: boolean,
  ): string {
    const config = slug ? catalog[slug] : undefined;
    const label = config?.label || this.toTitleCase(slug);
    const kind = config?.kind || defaultKind;
    const detail = config?.detail || 'Angular UI Patterns';

    return this.withSiteTitle(this.angularTitle(label, kind, isApi), detail);
  }

  private themeTitle(slug: string | undefined): string {
    if (slug === 'customize' || slug === 'customize-theme') {
      return this.withSiteTitle('Customize Angular Themes', 'Design Tokens and Runtime Theming');
    }

    if (slug === 'colors') {
      return this.withSiteTitle('Angular Theme Colors', 'Design Tokens and Palettes');
    }

    if (slug === 'typography') {
      return this.withSiteTitle('Angular Typography Theme', 'Type Scales and Text Styles');
    }

    if (slug === 'playground') {
      return this.withSiteTitle('Angular Theme Playground', 'Preview Tokens and Component Styles');
    }

    if (slug === 'generator') {
      return this.withSiteTitle('Angular Theme Generator', 'Seed Colors and CSS Color Mix');
    }

    return this.withSiteTitle('Angular Theme Documentation', 'Tokens and Runtime Theming');
  }

  private angularTitle(label: string, kind: string, isApi: boolean): string {
    const suffix = isApi ? ' API' : '';
    return `Angular ${label} ${kind}${suffix}`;
  }

  private withSiteTitle(title: string, detail?: string): string {
    const cleanTitle = this.cleanTitle(title) || 'Documentation';
    const cleanDetail = this.cleanTitle(detail);
    const pageTitle = cleanDetail ? `${cleanTitle}${this.detailSeparator}${cleanDetail}` : cleanTitle;
    const siteTitle = this.cleanTitle(this.environment.getValue('pageTitle'));

    return siteTitle ? `${pageTitle} | ${siteTitle}` : pageTitle;
  }

  private getPathSegments(url: string): string[] {
    return url
      .split(/[?#]/)[0]
      .replace(/^\/+|\/+$/g, '')
      .split('/')
      .filter(Boolean);
  }

  private cleanTitle(title: string | undefined): string | null {
    if (!title) {
      return null;
    }

    const clean = title
      .split('/')
      .map((part) => part.trim())
      .filter((part) => part && part.toLowerCase() !== 'undefined')
      .join(' - ')
      .trim();

    return clean || null;
  }

  private toTitleCase(slug: string | undefined): string {
    if (!slug) {
      return 'UI';
    }

    return slug
      .split('-')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
