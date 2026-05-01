import {
  Component,
  computed,
  signal,
  TemplateRef,
  contentChildren,
  effect,
  input, output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Icon } from '@ngstarter/components/icon';
import { Tooltip, TooltipPosition } from '@ngstarter/components/tooltip';
import { SidePanelTabConfig, PanelPosition } from '../side-panel.types';
import { SidePanelTab } from '../side-panel-tab/side-panel-tab';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'ngs-side-panel',
  exportAs: 'ngsSidePanel',
  imports: [
    CommonModule,

    Tooltip,
    Icon,
    Button,
  ],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.scss',
  host: {
    'class': 'ngs-side-panel',
    '[class.panel-open]': 'isOpen()',
    '[class.position-right]': 'isPositionRight()',
  }
})
export class SidePanel {
  position = input<PanelPosition>('right');

  isPositionRight = computed(() => this.position() === 'right');
  tooltipPosition = computed<TooltipPosition>(() => {
    return this.position() === 'left' ? 'right' : 'left';
  });
  private projectedTabsQuery = contentChildren(SidePanelTab);
  protected internalTabs = signal<SidePanelTabConfig[]>([]);
  activeTabId = signal<string | null>(null);
  isOpen = signal(false);

  readonly opened = output<void>();
  readonly closed = output<void>();

  selectedTabContent = computed<TemplateRef<any> | null>(() => {
    if (!this.isOpen() || !this.activeTabId()) {
      return null;
    }
    const activeTab = this.internalTabs().find(tab => tab.tabId === this.activeTabId());
    return activeTab ? activeTab.content : null;
  });

  constructor() {
    effect(() => {
      const projectedTabs = this.projectedTabsQuery();
      this.internalTabs.set(
        projectedTabs.map(tabComp => ({
          tabId: tabComp.tabId(),
          label: tabComp.label(),
          icon: tabComp.icon(),
          content: tabComp.content(),
        }))
      );
      const currentActiveId = this.activeTabId();
      const tabsArray = this.internalTabs();

      if (tabsArray.length === 0 && this.isOpen()) {
        this.isOpen.set(false);
        this.activeTabId.set(null);
      } else if (currentActiveId && !tabsArray.find(t => t.tabId === currentActiveId)) {
        this.activeTabId.set(null);
      }
    });
  }

  toggleTab(tabId: string): void {
    if (!this.isOpen()) {
      this.activeTabId.set(tabId);
      this.isOpen.set(true);
      this.opened.emit();
    } else {
      if (this.activeTabId() === tabId) {
        this.close();
      } else {
        this.activeTabId.set(tabId);
      }
    }
  }

  close(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  protected isTemplateRef(value: any): value is TemplateRef<any> {
    return value instanceof TemplateRef;
  }
}
