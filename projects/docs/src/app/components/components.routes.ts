import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('../@meta/category-overview/category-overview').then(c => c.CategoryOverview),
    title: 'Angular Components Documentation',
    data: {
      seoIntro: 'The NgStarter Angular components documentation covers accessible, standalone UI components for admin panels, dashboards, product interfaces, forms, overlays, data tables, navigation, feedback, loading states, media, and workflow screens.'
    }
  },
  {
    path: 'cookie-popup',
    loadChildren: () => import('./cookie-popup/routes').then(m => m.routes),
    title: 'Cookie Popup'
  },
  {
    path: 'action-required',
    loadChildren: () => import('./action-required/routes').then(m => m.routes),
    title: 'Action Required'
  },
  {
    path: 'avatar',
    loadChildren: () => import('./avatar/routes').then(m => m.routes),
    title: 'Avatar'
  },
  {
    path: 'kbd',
    loadChildren: () => import('./kdb/routes').then(m => m.routes),
    title: 'Kbd'
  },
  {
    path: 'timeline',
    loadChildren: () => import('./timeline/routes').then(m => m.routes),
    title: 'Timeline'
  },
  {
    path: 'events',
    loadChildren: () => import('./events/routes').then(m => m.routes),
    title: 'Events'
  },
  {
    path: 'badge',
    loadChildren: () => import('./badge/routes').then(m => m.routes),
    title: 'Badge'
  },
  {
    path: 'grid',
    loadChildren: () => import('./grid/routes').then(m => m.routes),
    title: 'Grid'
  },
  {
    path: 'bottom-sheet',
    loadChildren: () => import('./bottom-sheet/routes').then(m => m.routes),
    title: 'Bottom Sheet'
  },
  {
    path: 'card',
    loadChildren: () => import('./card/routes').then(m => m.routes),
    title: 'Card'
  },
  {
    path: 'card-overlay',
    loadChildren: () => import('./card-overlay/routes').then(m => m.routes),
    title: 'Card Overlay'
  },
  {
    path: 'carousel',
    loadChildren: () => import('./carousel/routes').then(m => m.routes),
    title: 'Carousel'
  },
  {
    path: 'chips',
    loadChildren: () => import('./chips/routes').then(m => m.routes),
    title: 'Chips'
  },
  {
    path: 'calendar',
    loadChildren: () => import('./calendar/routes').then(m => m.routes),
    title: 'Calendar'
  },
  {
    path: 'crop',
    loadChildren: () => import('./crop/routes').then(m => m.routes),
    title: 'Crop'
  },
  {
    path: 'emoji-picker',
    loadChildren: () => import('./emoji-picker/routes').then(m => m.routes),
    title: 'Emoji Picker'
  },
  {
    path: 'datepicker',
    loadChildren: () => import('./datepicker/routes').then(m => m.routes),
    title: 'Datepicker'
  },
  {
    path: 'timepicker',
    loadChildren: () => import('./timepicker/routes').then(m => m.routes),
    title: 'Timepicker'
  },
  {
    path: 'icon',
    loadChildren: () => import('./icon/routes').then(m => m.routes),
    title: 'Icon'
  },
  {
    path: 'dialog',
    loadChildren: () => import('./dialog/routes').then(m => m.routes),
    title: 'Dialog'
  },
  {
    path: 'digit-roller',
    loadChildren: () => import('./digit-roller/routes').then(m => m.routes),
    title: 'Digit Roller'
  },
  {
    path: 'divider',
    loadChildren: () => import('./divider/routes').then(m => m.routes),
    title: 'Divider'
  },
  {
    path: 'content-fade',
    loadChildren: () => import('./content-fade/routes').then(m => m.routes),
    title: 'Content Fade'
  },
  {
    path: 'expansion-panel',
    loadChildren: () => import('./expansion-panel/routes').then(m => m.routes),
    title: 'Expansion Panel'
  },
  {
    path: 'list',
    loadChildren: () => import('./list/routes').then(m => m.routes),
    title: 'List'
  },
  {
    path: 'menu',
    loadChildren: () => import('./menu/routes').then(m => m.routes),
    title: 'Menu'
  },
  {
    path: 'paginator',
    loadChildren: () => import('./paginator/routes').then(m => m.routes),
    title: 'Paginator'
  },
  {
    path: 'progress-bar',
    loadChildren: () => import('./progress-bar/routes').then(m => m.routes),
    title: 'Progress Bar'
  },
  {
    path: 'resizable-container',
    loadChildren: () => import('./resizable-container/routes').then(m => m.routes),
    title: 'Resizable Container'
  },
  {
    path: 'gauge',
    loadChildren: () => import('./gauge/routes').then(m => m.routes),
    title: 'Gauge'
  },
  {
    path: 'guided-tour',
    loadChildren: () => import('./guided-tour/routes').then(m => m.routes),
    title: 'Guided Tour'
  },
  {
    path: 'progress-spinner',
    loadChildren: () => import('./progress-spinner/routes').then(m => m.routes),
    title: 'Progress Spinner'
  },
  {
    path: 'slider',
    loadChildren: () => import('./slider/routes').then(m => m.routes),
    title: 'Slider'
  },
  {
    path: 'thumbnail-maker',
    loadChildren: () => import('./thumbnail-maker/routes').then(m => m.routes),
    title: 'Thumbnail Maker'
  },
  {
    path: 'expand',
    loadChildren: () => import('./expand/routes').then(m => m.routes),
    title: 'Expand'
  },
  {
    path: 'snackbar',
    loadChildren: () => import('./snackbar/routes').then(m => m.routes),
    title: 'Snackbar'
  },
  {
    path: 'comment-editor',
    loadChildren: () => import('./comment-editor/routes').then(m => m.routes),
    title: 'Comment Editor'
  },
  {
    path: 'table',
    loadChildren: () => import('./table/routes').then(m => m.routes),
    title: 'Table'
  },
  {
    path: 'sort',
    loadChildren: () => import('./sort/routes').then(m => m.routes),
    title: 'Sort'
  },
  {
    path: 'stepper',
    loadChildren: () => import('./stepper/routes').then(m => m.routes),
    title: 'Stepper'
  },
  {
    path: 'step-tracker',
    loadChildren: () => import('./step-tracker/routes').then(m => m.routes),
    title: 'Step Tracker'
  },
  {
    path: 'headless-stepper',
    loadChildren: () => import('./headless-stepper/routes').then(m => m.routes),
    title: 'Headless Stepper'
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/routes').then(m => m.routes),
    title: 'Tabs'
  },
  {
    path: 'tooltip',
    loadChildren: () => import('./tooltip/routes').then(m => m.routes),
    title: 'Tooltip'
  },
  {
    path: 'tree',
    loadChildren: () => import('./tree/routes').then(m => m.routes),
    title: 'Tree'
  },
  {
    path: 'skeleton',
    loadChildren: () => import('./skeleton/routes').then(m => m.routes),
    title: 'Skeleton'
  },
  {
    path: 'alert',
    loadChildren: () => import('./alert/routes').then(m => m.routes),
    title: 'Alert'
  },
  {
    path: 'popover',
    loadChildren: () => import('./popover/routes').then(m => m.routes),
    title: 'Popover'
  },
  {
    path: 'color-picker',
    loadChildren: () => import('./color-picker/routes').then(m => m.routes),
    title: 'Color Picker'
  },
  {
    path: 'color-switcher',
    loadChildren: () => import('./color-switcher/routes').then(m => m.routes),
    title: 'Color Switcher'
  },
  {
    path: 'upload',
    loadChildren: () => import('./upload/routes').then(m => m.routes),
    title: 'Upload'
  },
  {
    path: 'file-type',
    loadChildren: () => import('./file-type/routes').then(m => m.routes),
    title: 'File Type'
  },
  {
    path: 'command-bar',
    loadChildren: () => import('./command-bar/routes').then(m => m.routes),
    title: 'Command Bar'
  },
  {
    path: 'filter-builder',
    loadChildren: () => import('./filter-builder/routes').then(m => m.routes),
    title: 'Filter Builder'
  },
  {
    path: 'panel',
    loadChildren: () => import('./panel/routes').then(m => m.routes),
    title: 'Panel'
  },
  {
    path: 'incidents',
    loadChildren: () => import('./incidents/routes').then(m => m.routes),
    title: 'Incidents'
  },
  {
    path: 'layout',
    loadChildren: () => import('./layout/routes').then(m => m.routes),
    title: 'Layout'
  },
  {
    path: 'suggestions',
    loadChildren: () => import('./suggestions/routes').then(m => m.routes),
    title: 'Suggestions'
  },
  {
    path: 'announcement',
    loadChildren: () => import('./announcement/routes').then(m => m.routes),
    title: 'Announcement'
  },
  {
    path: 'empty-state',
    loadChildren: () => import('./empty-state/routes').then(m => m.routes),
    title: 'Empty State'
  },
  {
    path: 'confirm',
    loadChildren: () => import('./confirm/routes').then(m => m.routes),
    title: 'Confirm'
  },
  {
    path: 'image-viewer',
    loadChildren: () => import('./image-viewer/routes').then(m => m.routes),
    title: 'Image Viewer'
  },
  {
    path: 'video-viewer',
    loadChildren: () => import('./video-viewer/routes').then(m => m.routes),
    title: 'Video Viewer'
  },
  {
    path: 'image-zoom-viewer',
    loadChildren: () => import('./image-zoom-viewer/routes').then(m => m.routes),
    title: 'Image Zoom Viewer'
  },
  {
    path: 'image-resizer',
    loadChildren: () => import('./image-resizer/routes').then(m => m.routes),
    title: 'Image Resizer'
  },
  {
    path: 'image-placeholder',
    loadChildren: () => import('./image-placeholder/routes').then(m => m.routes),
    title: 'Image Placeholder'
  },
  {
    path: 'marquee',
    loadChildren: () => import('./marquee/routes').then(m => m.routes),
    title: 'Marquee'
  },
  {
    path: 'text-editor',
    loadChildren: () => import('./text-editor/routes').then(m => m.routes),
    title: 'Text Editor'
  },
  {
    path: 'screen-loader',
    loadChildren: () => import('./screen-loader/routes').then(m => m.routes),
    title: 'Screen Loader'
  },
  {
    path: 'sidenav',
    loadChildren: () => import('./sidenav/routes').then(m => m.routes),
    title: 'Sidenav'
  },
  {
    path: 'drawer',
    loadChildren: () => import('./drawer/routes').then(m => m.routes),
    title: 'Drawer'
  },
  {
    path: 'comparison-slider',
    loadChildren: () => import('./comparison-slider/routes').then(m => m.routes),
    title: 'Comparison Slider'
  },
  {
    path: 'signature-pad',
    loadChildren: () => import('./signature-pad/routes').then(m => m.routes),
    title: 'Signature Pad'
  },
  {
    path: 'typed-signature-pad',
    loadChildren: () => import('./typed-signature-pad/routes').then(m => m.routes),
    title: 'Typed Signature Pad'
  },
  {
    path: 'notifications',
    loadChildren: () => import('./notifications/routes').then(m => m.routes),
    title: 'Notifications'
  },
  {
    path: 'block-loader',
    loadChildren: () => import('./block-loader/routes').then(m => m.routes),
    title: 'Block Loader'
  },
  {
    path: 'code-highlighter',
    loadChildren: () => import('./code-highlighter/routes').then(m => m.routes),
    title: 'Code Highlighter'
  },
  {
    path: 'tiles',
    loadChildren: () => import('./tiles/routes').then(m => m.routes),
    title: 'Tiles'
  },
  {
    path: 'split-pane',
    loadChildren: () => import('./split-pane/routes').then(m => m.routes),
    title: 'Split Pane'
  },
  {
    path: 'toolbar',
    loadChildren: () => import('./toolbar/routes').then(m => m.routes),
    title: 'Toolbar'
  },
];
