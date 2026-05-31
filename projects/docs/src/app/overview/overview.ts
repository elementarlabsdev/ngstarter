import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Card, CardContent, CardFooter } from '@ngstarter-ui/components/card';
import { OrderByPipe } from '@ngstarter-ui/components/core';

type OverviewItem = {
  routerLink: string;
  imageUrl: string;
  name: string;
};

type OverviewCard = OverviewItem & {
  imageAlt: string;
  imageTitle: string;
};

const imageAltOverrides: Record<string, string> = {
  Calendar: 'Angular Calendar component month view with event markers',
  Datepicker: 'Angular Datepicker component calendar overlay screenshot',
  Notifications: 'Angular Notification feed component example',
  Table: 'Angular Table component with filtering and pagination'
};

function withImageMetadata(item: OverviewItem): OverviewCard {
  const imageAlt = imageAltOverrides[item.name] ?? `Angular ${item.name} component example screenshot`;

  return {
    ...item,
    imageAlt,
    imageTitle: `${item.name} component documentation preview`
  };
}

@Component({
  imports: [
    RouterLink,
    Card,
    CardContent,
    CardFooter,
    OrderByPipe
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {
  items = signal([
    {
      routerLink: '/components/action-required',
      imageUrl: 'assets/overview/action-required.svg',
      name: 'Action Required'
    },
    {
      routerLink: '/components/alert',
      imageUrl: 'assets/overview/alert.svg',
      name: 'Alert'
    },
    {
      routerLink: '/components/announcement',
      imageUrl: 'assets/overview/announcement.svg',
      name: 'Announcement'
    },
    {
      routerLink: '/forms/autocomplete',
      imageUrl: 'assets/overview/autocomplete.svg',
      name: 'Autocomplete'
    },
    {
      routerLink: '/components/avatar',
      imageUrl: 'assets/overview/avatar.svg',
      name: 'Avatar'
    },
    {
      routerLink: '/components/badge',
      imageUrl: 'assets/overview/badge.svg',
      name: 'Badge'
    },
    {
      routerLink: '/components/block-loader',
      imageUrl: 'assets/overview/block-loader.svg',
      name: 'Block Loader'
    },
    {
      routerLink: '/components/bottom-sheet',
      imageUrl: 'assets/overview/bottom-sheet.svg',
      name: 'Bottom Sheet'
    },
    {
      routerLink: '/navigation/breadcrumbs',
      imageUrl: 'assets/overview/breadcrumbs.svg',
      name: 'Breadcrumbs'
    },
    {
      routerLink: '/forms/buttons',
      imageUrl: 'assets/overview/button.svg',
      name: 'Button'
    },
    {
      routerLink: '/forms/button-toggle',
      imageUrl: 'assets/overview/button-toggle.svg',
      name: 'Button Toggle'
    },
    {
      routerLink: '/components/calendar',
      imageUrl: 'assets/overview/calendar.svg',
      name: 'Calendar'
    },
    {
      routerLink: '/components/card',
      imageUrl: 'assets/overview/card.svg',
      name: 'Card'
    },
    {
      routerLink: '/components/card-overlay',
      imageUrl: 'assets/overview/card-overlay.svg',
      name: 'Card Overlay'
    },
    {
      routerLink: '/components/carousel',
      imageUrl: 'assets/overview/carousel.svg',
      name: 'Carousel'
    },
    {
      routerLink: '/forms/checkbox',
      imageUrl: 'assets/overview/checkbox.svg',
      name: 'Checkbox'
    },
    {
      routerLink: '/components/chips',
      imageUrl: 'assets/overview/chips.svg',
      name: 'Chips'
    },
    {
      routerLink: '/components/code-highlighter',
      imageUrl: 'assets/overview/code-highlighter.svg',
      name: 'Code Highlighter'
    },
    {
      routerLink: '/components/color-picker',
      imageUrl: 'assets/overview/color-picker.svg',
      name: 'Color Picker'
    },
    {
      routerLink: '/components/color-switcher',
      imageUrl: 'assets/overview/color-switcher.svg',
      name: 'Color Switcher'
    },
    {
      routerLink: '/components/command-bar',
      imageUrl: 'assets/overview/command-bar.svg',
      name: 'Command Bar'
    },
    {
      routerLink: '/components/comment-editor',
      imageUrl: 'assets/overview/comment-editor.svg',
      name: 'Comment Editor'
    },
    {
      routerLink: '/components/comparison-slider',
      imageUrl: 'assets/overview/comparison-slider.svg',
      name: 'Comparison Slider'
    },
    {
      routerLink: '/components/confirm',
      imageUrl: 'assets/overview/confirm.svg',
      name: 'Confirm'
    },
    {
      routerLink: '/libraries/content-editor',
      imageUrl: 'assets/overview/content-editor.svg',
      name: 'Content Editor'
    },
    {
      routerLink: '/components/content-fade',
      imageUrl: 'assets/overview/content-fade.svg',
      name: 'Content Fade'
    },
    {
      routerLink: '/components/cookie-popup',
      imageUrl: 'assets/overview/cookie-popup.svg',
      name: 'Cookie Popup'
    },
    {
      routerLink: '/forms/country',
      imageUrl: 'assets/overview/country-select.svg',
      name: 'Country Select'
    },
    {
      routerLink: '/components/crop',
      imageUrl: 'assets/overview/crop.svg',
      name: 'Crop'
    },
    {
      routerLink: '/forms/currency-select',
      imageUrl: 'assets/overview/currency-select.svg',
      name: 'Currency Select'
    },
    {
      routerLink: '/libraries/data-view',
      imageUrl: 'assets/overview/data-view.svg',
      name: 'Data View'
    },
    {
      routerLink: '/forms/date-format-select',
      imageUrl: 'assets/overview/date-format-select.svg',
      name: 'Date Format Select'
    },
    {
      routerLink: '/components/datepicker',
      imageUrl: 'assets/overview/datepicker.svg',
      name: 'Datepicker'
    },
    {
      routerLink: '/components/digit-roller',
      imageUrl: 'assets/overview/digit-roller.svg',
      name: 'Digit Roller'
    },
    {
      routerLink: '/components/dialog',
      imageUrl: 'assets/overview/dialog.svg',
      name: 'Dialog'
    },
    {
      routerLink: '/components/divider',
      imageUrl: 'assets/overview/divider.svg',
      name: 'Divider'
    },
    {
      routerLink: '/components/drawer',
      imageUrl: 'assets/overview/drawer.svg',
      name: 'Drawer'
    },
    {
      routerLink: '/components/emoji-picker',
      imageUrl: 'assets/overview/emoji-picker.svg',
      name: 'Emoji Picker'
    },
    {
      routerLink: '/components/empty-state',
      imageUrl: 'assets/overview/empty-state.svg',
      name: 'Empty State'
    },
    {
      routerLink: '/components/expand',
      imageUrl: 'assets/overview/expand.svg',
      name: 'Expand'
    },
    {
      routerLink: '/components/expansion-panel',
      imageUrl: 'assets/overview/expansion.svg',
      name: 'Expansion Panel'
    },
    {
      routerLink: '/components/filter-builder',
      imageUrl: 'assets/overview/filter-builder.svg',
      name: 'Filter Builder'
    },
    {
      routerLink: '/forms/form-renderer',
      imageUrl: 'assets/overview/form-renderer.svg',
      name: 'Form Renderer'
    },
    {
      routerLink: '/components/gauge',
      imageUrl: 'assets/overview/gauge.svg',
      name: 'Gauge'
    },
    {
      routerLink: '/components/grid',
      imageUrl: 'assets/overview/grid.svg',
      name: 'Grid'
    },
    {
      routerLink: '/components/guided-tour',
      imageUrl: 'assets/overview/guided-tour.svg',
      name: 'Guided Tour'
    },
    {
      routerLink: '/components/icon',
      imageUrl: 'assets/overview/icon.svg',
      name: 'Icon'
    },
    {
      routerLink: '/libraries/image-designer',
      imageUrl: 'assets/overview/image-designer.svg',
      name: 'Image Designer'
    },
    {
      routerLink: '/components/image-placeholder',
      imageUrl: 'assets/overview/image-placeholder.svg',
      name: 'Image Placeholder'
    },
    {
      routerLink: '/components/image-resizer',
      imageUrl: 'assets/overview/image-resizer.svg',
      name: 'Image Resizer'
    },
    {
      routerLink: '/components/image-viewer',
      imageUrl: 'assets/overview/image-viewer.svg',
      name: 'Image Viewer'
    },
    {
      routerLink: '/components/image-zoom-viewer',
      imageUrl: 'assets/overview/image-zoom-viewer.svg',
      name: 'Image Zoom Viewer'
    },
    {
      routerLink: '/components/incidents',
      imageUrl: 'assets/overview/incidents.svg',
      name: 'Incidents'
    },
    {
      routerLink: '/forms/inline-text-edit',
      imageUrl: 'assets/overview/inline-text-edit.svg',
      name: 'Inline Text Edit'
    },
    {
      routerLink: '/forms/input',
      imageUrl: 'assets/overview/input.svg',
      name: 'Input'
    },
    {
      routerLink: '/forms/input-mask',
      imageUrl: 'assets/overview/input-mask.svg',
      name: 'Input Mask'
    },
    {
      routerLink: '/forms/input-validator',
      imageUrl: 'assets/overview/input-validator.svg',
      name: 'Input Validator'
    },
    {
      routerLink: '/libraries/kanban-board',
      imageUrl: 'assets/overview/kanban-board.svg',
      name: 'Kanban Board'
    },
    {
      routerLink: '/components/kbd',
      imageUrl: 'assets/overview/kbd.svg',
      name: 'Kbd'
    },
    {
      routerLink: '/components/layout',
      imageUrl: 'assets/overview/layout.svg',
      name: 'Layout'
    },
    {
      routerLink: '/components/list',
      imageUrl: 'assets/overview/list.svg',
      name: 'List'
    },
    {
      routerLink: '/components/marquee',
      imageUrl: 'assets/overview/marquee.svg',
      name: 'Marquee'
    },
    {
      routerLink: '/components/menu',
      imageUrl: 'assets/overview/menu.svg',
      name: 'Menu'
    },
    {
      routerLink: '/micro-charts',
      imageUrl: 'assets/overview/micro-chart.svg',
      name: 'Micro Charts'
    },
    {
      routerLink: '/navigation/navigation',
      imageUrl: 'assets/overview/navigation.svg',
      name: 'Navigation'
    },
    {
      routerLink: '/components/notifications',
      imageUrl: 'assets/overview/notifications.svg',
      name: 'Notifications'
    },
    {
      routerLink: '/forms/number-input',
      imageUrl: 'assets/overview/number-input.svg',
      name: 'Number Input'
    },
    {
      routerLink: '/components/paginator',
      imageUrl: 'assets/overview/paginator.svg',
      name: 'Paginator'
    },
    {
      routerLink: '/components/panel',
      imageUrl: 'assets/overview/panel.svg',
      name: 'Panel'
    },
    {
      routerLink: '/forms/password-strength',
      imageUrl: 'assets/overview/password-strength.svg',
      name: 'Password Strength'
    },
    {
      routerLink: '/forms/phone-input',
      imageUrl: 'assets/overview/phone-input.svg',
      name: 'Phone Input'
    },
    {
      routerLink: '/forms/pin-input',
      imageUrl: 'assets/overview/pin-input.svg',
      name: 'Pin Input'
    },
    {
      routerLink: '/components/popover',
      imageUrl: 'assets/overview/popover.svg',
      name: 'Popover'
    },
    {
      routerLink: '/components/progress-bar',
      imageUrl: 'assets/overview/progress-bar.svg',
      name: 'Progress Bar'
    },
    {
      routerLink: '/components/progress-spinner',
      imageUrl: 'assets/overview/spinner.svg',
      name: 'Progress Spinner'
    },
    {
      routerLink: '/forms/radio',
      imageUrl: 'assets/overview/radio.svg',
      name: 'Radio'
    },
    {
      routerLink: '/navigation/rail-nav',
      imageUrl: 'assets/overview/rail-nav.svg',
      name: 'Rail Navigation'
    },
    {
      routerLink: '/components/resizable-container',
      imageUrl: 'assets/overview/resizable-container.svg',
      name: 'Resizable Container'
    },
    {
      routerLink: '/components/screen-loader',
      imageUrl: 'assets/overview/screen-loader.svg',
      name: 'Screen Loader'
    },
    {
      routerLink: '/forms/segmented',
      imageUrl: 'assets/overview/segmented.svg',
      name: 'Segmented'
    },
    {
      routerLink: '/forms/select',
      imageUrl: 'assets/overview/select.svg',
      name: 'Select'
    },
    {
      routerLink: '/navigation/side-panel',
      imageUrl: 'assets/overview/side-panel.svg',
      name: 'Side Panel'
    },
    {
      routerLink: '/navigation/sidebar',
      imageUrl: 'assets/overview/sidebar.svg',
      name: 'Sidebar'
    },
    {
      routerLink: '/components/sidenav',
      imageUrl: 'assets/overview/sidenav.svg',
      name: 'Sidenav'
    },
    {
      routerLink: '/components/signature-pad',
      imageUrl: 'assets/overview/signature-pad.svg',
      name: 'Signature Pad'
    },
    {
      routerLink: '/components/skeleton',
      imageUrl: 'assets/overview/skeleton.svg',
      name: 'Skeleton'
    },
    {
      routerLink: '/forms/slide-toggle',
      imageUrl: 'assets/overview/slide-toggle.svg',
      name: 'Slide Toggle'
    },
    {
      routerLink: '/components/slider',
      imageUrl: 'assets/overview/slider.svg',
      name: 'Slider'
    },
    {
      routerLink: '/components/snackbar',
      imageUrl: 'assets/overview/snack-bar.svg',
      name: 'Snackbar'
    },
    {
      routerLink: '/components/split-pane',
      imageUrl: 'assets/overview/split.svg',
      name: 'Split Pane'
    },
    {
      routerLink: '/components/stepper',
      imageUrl: 'assets/overview/stepper.svg',
      name: 'Stepper'
    },
    {
      routerLink: '/components/step-tracker',
      imageUrl: 'assets/overview/step-tracker-preview.svg',
      name: 'Step Tracker'
    },
    {
      routerLink: '/components/headless-stepper',
      imageUrl: 'assets/overview/headless-stepper.svg',
      name: 'Headless Stepper'
    },
    {
      routerLink: '/components/suggestions',
      imageUrl: 'assets/overview/suggestions.svg',
      name: 'Suggestions'
    },
    {
      routerLink: '/navigation/tab-panel',
      imageUrl: 'assets/overview/tab-panel.svg',
      name: 'Tab Panel'
    },
    {
      routerLink: '/components/table',
      imageUrl: 'assets/overview/table.svg',
      name: 'Table'
    },
    {
      routerLink: '/components/tabs',
      imageUrl: 'assets/overview/tabs.svg',
      name: 'Tabs'
    },
    {
      routerLink: '/components/text-editor',
      imageUrl: 'assets/overview/text-editor.svg',
      name: 'Text Editor'
    },
    {
      routerLink: '/components/thumbnail-maker',
      imageUrl: 'assets/overview/thumbnail-maker.svg',
      name: 'Thumbnail Maker'
    },
    {
      routerLink: '/components/tiles',
      imageUrl: 'assets/overview/tiles.svg',
      name: 'Tiles'
    },
    {
      routerLink: '/components/timeline',
      imageUrl: 'assets/overview/timeline.svg',
      name: 'Timeline'
    },
    {
      routerLink: '/components/timepicker',
      imageUrl: 'assets/overview/timepicker.svg',
      name: 'Timepicker'
    },
    {
      routerLink: '/forms/timezone',
      imageUrl: 'assets/overview/timezone-select.svg',
      name: 'Timezone Select'
    },
    {
      routerLink: '/components/toolbar',
      imageUrl: 'assets/overview/toolbar.svg',
      name: 'Toolbar'
    },
    {
      routerLink: '/components/tooltip',
      imageUrl: 'assets/overview/tooltip.svg',
      name: 'Tooltip'
    },
    {
      routerLink: '/components/tree',
      imageUrl: 'assets/overview/tree.svg',
      name: 'Tree'
    },
    {
      routerLink: '/components/upload',
      imageUrl: 'assets/overview/upload.svg',
      name: 'Upload'
    },
    {
      routerLink: '/libraries/video-player',
      imageUrl: 'assets/overview/video-player.svg',
      name: 'Video Player'
    },
    {
      routerLink: '/components/video-viewer',
      imageUrl: 'assets/overview/video-viewer.svg',
      name: 'Video Viewer'
    },
    {
      routerLink: '/libraries/visual-builder',
      imageUrl: 'assets/overview/visual-builder.svg',
      name: 'Visual Builder'
    }
  ].map(withImageMetadata));
}
