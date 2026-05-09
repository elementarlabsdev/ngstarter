export interface NavItem {
  key: string;
  label: string;
  icon: string;
}

export interface WalletCard {
  title: string;
  balance: string;
  delta: string;
  trend: 'up' | 'down' | 'alert';
  trendIcon: string;
}

export interface AssetItem {
  name: string;
  percent: string;
  value: number;
  color: string;
  accent: string;
  icon: string;
}

export interface AlertStat {
  label: string;
  value: string;
  icon: string;
}

export interface GrowthSummary {
  totalBalance: string;
  goalSaved: string;
  goalTotal: string;
  goalPercent: string;
  goalWidth: string;
  pocketName: string;
}
