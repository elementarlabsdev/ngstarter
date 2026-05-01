export type AnnouncementVariant = 'neutral' | 'negative' | 'warning' | 'positive' | 'informative' | string;
export interface AnnouncementData {
  title?: string;
  iconName?: string;
  variant: AnnouncementVariant;
  message: string;
  linkTo?: AnnouncementLinkTo;
}

export interface AnnouncementLinkTo {
  url: string;
  text?: string;
  target?: string;
}
