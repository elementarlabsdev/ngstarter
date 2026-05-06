import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'cookie-popup',
    loadChildren: () => import('./cookie-popup/routes').then(m => m.routes)
  },
  {
    path: 'action-required',
    loadChildren: () => import('./action-required/routes').then(m => m.routes)
  },
  {
    path: 'avatar',
    loadChildren: () => import('./avatar/avatar.module').then(m => m.AvatarModule)
  },
  {
    path: 'kbd',
    loadChildren: () => import('./kdb/routes').then(m => m.routes)
  },
  {
    path: 'timeline',
    loadChildren: () => import('./timeline/timeline.module').then(m => m.TimelineModule)
  },
  {
    path: 'badge',
    loadChildren: () => import('./badge/badge.module').then(m => m.BadgeModule)
  },
  {
    path: 'grid',
    loadChildren: () => import('./grid/grid.module').then(m => m.GridModule)
  },
  {
    path: 'bottom-sheet',
    loadChildren: () => import('./bottom-sheet/bottom-sheet.module').then(m => m.BottomSheetModule)
  },
  {
    path: 'card',
    loadChildren: () => import('./card/card.module').then(m => m.CardModule)
  },
  {
    path: 'card-overlay',
    loadChildren: () => import('./card-overlay/card-overlay.module').then(m => m.CardOverlayModule)
  },
  {
    path: 'carousel',
    loadChildren: () => import('./carousel/routes').then(m => m.routes)
  },
  {
    path: 'chips',
    loadChildren: () => import('./chips/routes').then(m => m.routes)
  },
  {
    path: 'crop',
    loadChildren: () => import('./crop/crop-module').then(m => m.CropModule)
  },
  {
    path: 'emoji-picker',
    loadChildren: () => import('./emoji-picker/routes').then(m => m.routes)
  },
  {
    path: 'datepicker',
    loadChildren: () => import('./datepicker/routes').then(m => m.routes)
  },
  {
    path: 'timepicker',
    loadChildren: () => import('./timepicker/routes').then(m => m.routes)
  },
  {
    path: 'icon',
    loadChildren: () => import('./icon/icon.module').then(m => m.IconModule)
  },
  {
    path: 'dialog',
    loadChildren: () => import('./dialog/dialog.module').then(m => m.DialogModule)
  },
  {
    path: 'divider',
    loadChildren: () => import('./divider/divider.module').then(m => m.DividerModule)
  },
  {
    path: 'content-fade',
    loadChildren: () => import('./content-fade/routes').then(m => m.routes)
  },
  {
    path: 'expansion-panel',
    loadChildren: () => import('./expansion-panel/expansion-panel.module').then(m => m.ExpansionPanelModule)
  },
  {
    path: 'list',
    loadChildren: () => import('./list/routes').then(m => m.routes)
  },
  {
    path: 'menu',
    loadChildren: () => import('./menu/menu.module').then(m => m.MenuModule)
  },
  {
    path: 'paginator',
    loadChildren: () => import('./paginator/routes').then(m => m.routes)
  },
  {
    path: 'progress-bar',
    loadChildren: () => import('./progress-bar/routes').then(m => m.routes)
  },
  {
    path: 'resizable-container',
    loadChildren: () => import('./resizable-container/routes').then(m => m.routes)
  },
  {
    path: 'gauge',
    loadChildren: () => import('./gauge/gauge.module').then(m => m.GaugeModule)
  },
  {
    path: 'guided-tour',
    loadChildren: () => import('./guided-tour/routes').then(m => m.routes)
  },
  {
    path: 'progress-spinner',
    loadChildren: () => import('./progress-spinner/progress-spinner.module').then(m => m.ProgressSpinnerModule)
  },
  {
    path: 'slider',
    loadChildren: () => import('./slider/slider.module').then(m => m.SliderModule)
  },
  {
    path: 'thumbnail-maker',
    loadChildren: () => import('./thumbnail-maker/thumbnail-maker.module').then(m => m.ThumbnailMakerModule)
  },
  {
    path: 'expand',
    loadChildren: () => import('./expand/expand.module').then(m => m.ExpandModule)
  },
  {
    path: 'snackbar',
    loadChildren: () => import('./snackbar/routes').then(m => m.routes)
  },
  {
    path: 'comment-editor',
    loadChildren: () => import('./comment-editor/routes').then(m => m.routes)
  },
  {
    path: 'table',
    loadChildren: () => import('./table/routes').then(m => m.routes)
  },
  {
    path: 'stepper',
    loadChildren: () => import('./stepper/stepper.module').then(m => m.StepperModule)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsModule)
  },
  {
    path: 'tooltip',
    loadChildren: () => import('./tooltip/tooltip.module').then(m => m.TooltipModule)
  },
  {
    path: 'tree',
    loadChildren: () => import('./tree/routes').then(m => m.routes)
  },
  {
    path: 'skeleton',
    loadChildren: () => import('./skeleton/skeleton.module').then(m => m.SkeletonModule)
  },
  {
    path: 'alert',
    loadChildren: () => import('./alert/routes').then(m => m.routes)
  },
  {
    path: 'popover',
    loadChildren: () => import('./popover/routes').then(m => m.routes)
  },
  {
    path: 'color-picker',
    loadChildren: () => import('./color-picker/routes').then(m => m.routes)
  },
  {
    path: 'color-switcher',
    loadChildren: () => import('./color-switcher/routes').then(m => m.routes)
  },
  {
    path: 'upload',
    loadChildren: () => import('./upload/routes').then(m => m.routes)
  },
  {
    path: 'command-bar',
    loadChildren: () => import('./command-bar/routes').then(m => m.routes)
  },
  {
    path: 'filter-builder',
    loadChildren: () => import('./filter-builder/filter-builder.module').then(m => m.FilterBuilderModule)
  },
  {
    path: 'panel',
    loadChildren: () => import('./panel/panel.module').then(m => m.PanelModule)
  },
  {
    path: 'incidents',
    loadChildren: () => import('./incidents/incidents.module').then(m => m.IncidentsModule)
  },
  {
    path: 'layout',
    loadChildren: () => import('./layout/layout.module').then(m => m.LayoutModule)
  },
  {
    path: 'suggestions',
    loadChildren: () => import('./suggestions/suggestions.module').then(m => m.SuggestionsModule)
  },
  {
    path: 'announcement',
    loadChildren: () => import('./announcement/announcement.module').then(m => m.AnnouncementModule)
  },
  {
    path: 'empty-state',
    loadChildren: () => import('./empty-state/routes').then(m => m.routes)
  },
  {
    path: 'confirm',
    loadChildren: () => import('./confirm/routes').then(m => m.routes)
  },
  {
    path: 'image-viewer',
    loadChildren: () => import('./image-viewer/image-viewer.module').then(m => m.ImageViewerModule)
  },
  {
    path: 'video-viewer',
    loadChildren: () => import('./video-viewer/video-viewer.module').then(m => m.VideoViewerModule)
  },
  {
    path: 'image-zoom-viewer',
    loadChildren: () => import('./image-zoom-viewer/routes').then(m => m.routes)
  },
  {
    path: 'image-resizer',
    loadChildren: () => import('./image-resizer/routes').then(m => m.routes)
  },
  {
    path: 'image-placeholder',
    loadChildren: () => import('./image-placeholder/routes').then(m => m.routes)
  },
  {
    path: 'marquee',
    loadChildren: () => import('./marquee/marquee.module').then(m => m.MarqueeModule)
  },
  {
    path: 'text-editor',
    loadChildren: () => import('./text-editor/routes').then(m => m.routes)
  },
  {
    path: 'screen-loader',
    loadChildren: () => import('./screen-loader/screen-loader.module').then(m => m.ScreenLoaderModule)
  },
  {
    path: 'sidenav',
    loadChildren: () => import('./sidenav/sidenav.module').then(m => m.SidenavModule)
  },
  {
    path: 'drawer',
    loadChildren: () => import('./drawer/routes').then(m => m.routes)
  },
  {
    path: 'comparison-slider',
    loadChildren: () => import('./comparison-slider/routes').then(m => m.routes)
  },
  {
    path: 'signature-pad',
    loadChildren: () => import('./signature-pad/signature-pad.module').then(m => m.SignaturePadModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./notifications/routes').then(m => m.routes)
  },
  {
    path: 'block-loader',
    loadChildren: () => import('./block-loader/block-loader.module').then(m => m.BlockLoaderModule)
  },
  {
    path: 'code-highlighter',
    loadChildren: () => import('./code-highlighter/routes').then(m => m.routes)
  },
  {
    path: 'tiles',
    loadChildren: () => import('./tiles/routes').then(m => m.routes)
  },
  {
    path: 'split-pane',
    loadChildren: () => import('./split-pane/routes').then(m => m.routes)
  },
  {
    path: 'toolbar',
    loadChildren: () => import('./toolbar/routes').then(m => m.routes)
  },
];
