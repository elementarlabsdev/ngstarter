import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Grid, GridItem, GridItemConfig } from '@ngstarter-ui/components/grid';
import { Icon } from '@ngstarter-ui/components/icon';
import { Layout, LayoutContent } from '@ngstarter-ui/components/layout';
import {
  Navigation,
  NavigationItem,
  NavigationItemIconDirective,
} from '@ngstarter-ui/components/navigation';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { Sidenav, SidenavContainer, SidenavContent } from '@ngstarter-ui/components/sidenav';

import {
  AlertStat,
  AssetItem,
  GrowthSummary,
  NavItem,
  WalletCard,
} from './components/dashboard/dashboard.types';
import { PocketAssetBreakdown } from './components/dashboard/pocket-asset-breakdown/pocket-asset-breakdown';
import { SmartSpendingAlerts } from './components/dashboard/smart-spending-alerts/smart-spending-alerts';
import { SummaryGrowth } from './components/dashboard/summary-growth/summary-growth';
import { WalletPocketsGrid } from './components/dashboard/wallet-pockets-grid/wallet-pockets-grid';

@Component({
  selector: 'app-root',
  imports: [
    Button,
    Grid,
    Icon,
    Layout,
    LayoutContent,
    Navigation,
    NavigationItem,
    NavigationItemIconDirective,
    ScrollbarArea,
    Sidenav,
    SidenavContainer,
    SidenavContent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly brandName = signal('Minty');

  protected readonly primaryNav = signal<readonly NavItem[]>([
    { key: 'dashboard', label: 'Dashboard', icon: 'fluent:grid-24-filled' },
    { key: 'account', label: 'Account', icon: 'fluent:person-24-filled' },
    { key: 'cards', label: 'Cards', icon: 'fluent:card-ui-24-filled' },
    { key: 'transaction', label: 'Transaction', icon: 'fluent:clipboard-task-24-filled' },
    { key: 'payees', label: 'Payees', icon: 'fluent:money-24-filled' },
    { key: 'spend-groups', label: 'Spend groups', icon: 'fluent:people-team-24-filled' },
  ]);

  protected readonly secondaryNav = signal<readonly NavItem[]>([
    { key: 'invoices', label: 'Invoices', icon: 'fluent:document-bullet-list-24-filled' },
    { key: 'reports', label: 'Reports', icon: 'fluent:chart-multiple-24-filled' },
    { key: 'community', label: 'Community', icon: 'fluent:puzzle-piece-24-filled' },
    { key: 'news', label: 'News', icon: 'fluent:news-24-filled' },
  ]);

  protected readonly utilityNav = signal<readonly NavItem[]>([
    { key: 'feedback', label: 'Feedback', icon: 'fluent:chat-24-filled' },
    { key: 'help', label: 'Help', icon: 'fluent:headphones-24-filled' },
    { key: 'settings', label: 'Setting', icon: 'fluent:settings-24-filled' },
  ]);

  private readonly wallets = signal<readonly WalletCard[]>([
    {
      title: 'Main wallet',
      balance: '$1,245.50',
      delta: '+$120',
      trend: 'up',
      trendIcon: 'fluent:arrow-circle-up-24-filled',
    },
    {
      title: 'Saving pocket',
      balance: '$3,820.00',
      delta: '+$250',
      trend: 'up',
      trendIcon: 'fluent:arrow-circle-up-24-filled',
    },
    {
      title: 'Daily spending',
      balance: '$48.50',
      delta: '-$15',
      trend: 'down',
      trendIcon: 'fluent:arrow-circle-down-24-filled',
    },
    {
      title: 'Bills pocket',
      balance: '$560.00',
      delta: '2 bills due',
      trend: 'alert',
      trendIcon: 'fluent:warning-24-filled',
    },
  ]);

  private readonly assets = signal<readonly AssetItem[]>([
    {
      name: 'Main',
      percent: '44%',
      value: 44,
      color: '#eaf9ec',
      accent: '#71d968',
      icon: 'fluent:wallet-24-filled',
    },
    {
      name: 'Trip',
      percent: '18%',
      value: 18,
      color: '#fff1e7',
      accent: '#ff9156',
      icon: 'fluent:beach-24-filled',
    },
    {
      name: 'Daily',
      percent: '28%',
      value: 28,
      color: '#e5f3ff',
      accent: '#54ace8',
      icon: 'fluent:shopping-bag-24-filled',
    },
    {
      name: 'Other',
      percent: '10%',
      value: 10,
      color: '#eeeeee',
      accent: '#aaa',
      icon: 'fluent:apps-24-filled',
    },
  ]);

  private readonly alertStats = signal<readonly AlertStat[]>([
    { label: 'Risk level', value: 'High spending', icon: 'fluent:shield-24-filled' },
    { label: 'Daily spend', value: '$120', icon: 'fluent:money-24-filled' },
    { label: 'Trend', value: 'Next 4 days', icon: 'fluent:clock-24-filled' },
    { label: 'Confidence', value: '55%', icon: 'fluent:sparkle-24-filled' },
  ]);

  private readonly growthSummary = signal<GrowthSummary>({
    totalBalance: '$4,800.00',
    goalSaved: '$750',
    goalTotal: '$3,000',
    goalPercent: '25%',
    goalWidth: '23%',
    pocketName: 'Dream trip pocket',
  });

  protected readonly dashboardGridConfigs = signal<GridItemConfig[]>([
    {
      type: 'wallets',
      plain: true,
      component: () => Promise.resolve(WalletPocketsGrid),
    },
    {
      type: 'breakdown',
      plain: true,
      component: () => Promise.resolve(PocketAssetBreakdown),
    },
    {
      type: 'growth',
      plain: true,
      component: () => Promise.resolve(SummaryGrowth),
    },
    {
      type: 'alerts',
      plain: true,
      component: () => Promise.resolve(SmartSpendingAlerts),
    },
  ]);

  protected readonly dashboardGridItems = computed<GridItem[]>(() => [
    {
      id: 'wallets',
      type: 'wallets',
      columns: 12,
      content: this.wallets(),
    },
    {
      id: 'breakdown',
      type: 'breakdown',
      columns: 6,
      content: this.assets(),
    },
    {
      id: 'growth',
      type: 'growth',
      columns: 6,
      content: this.growthSummary(),
    },
    {
      id: 'alerts',
      type: 'alerts',
      columns: 12,
      content: this.alertStats(),
    },
  ]);
}
