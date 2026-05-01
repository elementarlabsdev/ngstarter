import {
  AfterViewInit,
  Component,
  contentChildren,
  effect,
  ElementRef,
  inject,
  TemplateRef,
  Injector,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  signal
} from '@angular/core';
import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import { ToolbarItem } from '../toolbar-item/toolbar-item';
import { ToolbarNav } from '../toolbar-nav/toolbar-nav';
import { ToolbarSpacer } from '../toolbar-spacer/toolbar-spacer';
import { ToolbarRow } from '../toolbar-row/toolbar-row';
import { ToolbarBaseItem } from '../toolbar-base-item';
import { Dialog, DialogRef } from '@ngstarter-ui/components/dialog';
import { Icon } from '@ngstarter-ui/components/icon';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'ngs-toolbar',
  exportAs: 'ngsToolbar',
  imports: [
    Icon,
    Button,
    NgTemplateOutlet
  ],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
  host: {
    'class': 'ngs-toolbar',
    '[class.ngs-toolbar-stacked]': '!!_rows().length'
  }
})
export class Toolbar implements AfterViewInit, OnDestroy {
  private _elementRef = inject(ElementRef);
  private _zone = inject(NgZone);
  private _platformId = inject(PLATFORM_ID);
  private _injector = inject(Injector);
  private _dialog = inject(Dialog);

  readonly toolbarItems = contentChildren(ToolbarItem, { descendants: true });
  readonly navItems = contentChildren(ToolbarNav, { descendants: true });
  readonly items = signal<ToolbarBaseItem[]>([]);
  readonly spacers = contentChildren(ToolbarSpacer, { descendants: true });
  readonly _rows = contentChildren(ToolbarRow, { descendants: true });

  protected readonly _overflowItems = signal<ToolbarBaseItem[]>([]);
  protected _dialogRef: DialogRef<any> | null = null;
  private _resizeObserver?: ResizeObserver;
  private _itemWidths = new Map<ToolbarBaseItem, number>();

  constructor() {
    effect(() => {
      this.items.set([...this.toolbarItems(), ...this.navItems()]);
    });
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    this._zone.runOutsideAngular(() => {
      this._resizeObserver = new ResizeObserver(() => {
        this._updateOverflow();
      });
      this._resizeObserver.observe(this._elementRef.nativeElement);

      // Also observe each item to update cached widths if they change
      this.items().forEach(item => {
        const el = item.elementRef.nativeElement;
        if (el instanceof HTMLElement) {
          this._resizeObserver?.observe(el);
        }
      });
    });

      // Handle items changes
      effect(() => {
        const currentItems = this.items();
        this._zone.runOutsideAngular(() => {
          // Clear widths for items that are gone
          for (const item of this._itemWidths.keys()) {
            if (!currentItems.includes(item)) {
              this._itemWidths.delete(item);
            }
          }

          currentItems.forEach(item => {
            const el = item.elementRef.nativeElement;
            if (el instanceof HTMLElement) {
              this._resizeObserver?.observe(el);
            }
          });
          this._updateOverflow();
        });
      }, { injector: this._injector });

        // Initial check
    setTimeout(() => {
      this._updateOverflow();
    }, 100);
  }

  ngOnDestroy() {
    this._resizeObserver?.disconnect();
  }

  protected _openOverflowDialog(template: TemplateRef<any>) {
    this._dialogRef = this._dialog.open(template, {
      width: '100%',
      height: '100%',
      maxWidth: '100vw',
      panelClass: 'ngs-toolbar-overflow-dialog-panel'
    });

    this._dialogRef.afterClosed().subscribe(() => {
      this._dialogRef = null;
    });
  }

  protected _closeOverflowDialog() {
    this._dialogRef?.close();
  }

  private _updateOverflow() {
    this._zone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        const container = this._elementRef.nativeElement;
        const containerWidth = container.clientWidth;
        const items = this.items();

        if (containerWidth === 0) {
          return;
        }

        if (items.length === 0) {
          if (this._overflowItems().length > 0) {
            this._zone.run(() => this._overflowItems.set([]));
          }
          return;
        }

        // Identify other elements taking up space (title, spacer, etc.)
        const children = Array.from(container.children) as HTMLElement[];
        let staticWidth = 0;
        const gap = 16;
        let staticCount = 0;

        children.forEach(child => {
          const tagName = child.tagName.toLowerCase();
          const isItem = tagName === 'ngs-toolbar-item' || tagName === 'ngs-toolbar-nav';
          const isOverflowButton = (tagName === 'button' || tagName === 'ngs-menu' || child.hasAttribute('ngs-menu-trigger') || child.hasAttribute('ngs-menu-trigger-for') || child.hasAttribute('ngsmenutriggerfor')) && (
            child.hasAttribute('ngs-icon-button') ||
            child.hasAttribute('ngsiconbutton') ||
            child.getAttribute('ngs-icon-button') !== null ||
            child.querySelector('ngs-icon[name*="more-vertical"]') ||
            child.querySelector('ngs-icon[name*="more"]') ||
            child.querySelector('button[ngs-icon-button]') ||
            child.querySelector('button[ngsiconbutton]')
          );
          const isMenu = tagName === 'ngs-menu' || child.hasAttribute('ngs-menu') || child.querySelector('ngs-menu');
          const isSpacer = tagName === 'ngs-toolbar-spacer' || child.hasAttribute('ngs-toolbar-spacer');

          // Check if this child contains any of the ToolbarItems we're tracking
          const containsManagedItem = items.some(item => child.contains(item.elementRef.nativeElement));

          const isVisible = child.offsetParent !== null || child.offsetWidth > 0;

          if (!isItem && !containsManagedItem && !isOverflowButton && !isMenu && isVisible) {
            if (!isSpacer) {
              staticWidth += child.offsetWidth;
            }
            staticCount++;
          }
        });

        // 1. Update widths of items that are NOT hidden
        let allWidthsKnown = true;
        items.forEach(item => {
          if (!item.hidden()) {
            const width = item.elementRef.nativeElement.offsetWidth;
            if (width > 0) {
              this._itemWidths.set(item, width);
            }
          }
          if (!this._itemWidths.has(item)) {
            allWidthsKnown = false;
          }
        });

        // 2. If some widths are unknown (e.g., hidden since start), we MUST show them briefly to measure
        if (!allWidthsKnown) {
          this._zone.run(() => {
            items.forEach(item => {
              if (!this._itemWidths.has(item)) {
                item.hidden.set(false);
              }
            });
          });
          return;
        }

        // 3. Calculate how many items fit
        const overflowItems: ToolbarBaseItem[] = [];
        const overflowButtonWidth = 48; // A bit more room for the overflow button

        // Total width if ALL items fit
        const totalItemsWidth = items.reduce((acc, item) => acc + (this._itemWidths.get(item) || 0), 0);
        const totalVisibleCountAll = staticCount + items.length;
        const totalGapsWidthAll = totalVisibleCountAll > 1 ? (totalVisibleCountAll - 1) * gap : 0;
        const totalWidthAllItems = staticWidth + totalItemsWidth + totalGapsWidthAll;

        if (totalWidthAllItems <= containerWidth) {
          this._zone.run(() => {
            items.forEach(item => item.hidden.set(false));
            if (this._overflowItems().length > 0) {
              this._overflowItems.set([]);
            }
          });
          return;
        }

        // Not all items fit, we need overflow button
        let currentItemsWidth = 0;
        let fitCount = 0;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const width = this._itemWidths.get(item) || 0;

          // If we add this item, we'll have:
          // staticCount + fitCount + 1 (this item) + 1 (overflow button)
          const potentialVisibleCount = staticCount + fitCount + 2;
          const potentialGapsWidth = (potentialVisibleCount - 1) * gap;
          const totalWidthWithThisItemAndOverflow = staticWidth + currentItemsWidth + width + potentialGapsWidth + overflowButtonWidth;

          if (totalWidthWithThisItemAndOverflow > containerWidth) {
            break;
          }

          currentItemsWidth += width;
          fitCount++;
        }

        for (let i = fitCount; i < items.length; i++) {
          overflowItems.push(items[i]);
        }

        // 4. Update visibility
        this._zone.run(() => {
          items.forEach((item, index) => {
            const shouldBeHidden = index >= fitCount;
            if (item.hidden() !== shouldBeHidden) {
              item.hidden.set(shouldBeHidden);
            }
          });

          const currentOverflow = this._overflowItems();
          const isSame = currentOverflow.length === overflowItems.length &&
                        currentOverflow.every((item, index) => item === overflowItems[index]);
          if (!isSame) {
            this._overflowItems.set(overflowItems);
          }
        });
      });
    });
  }
}
