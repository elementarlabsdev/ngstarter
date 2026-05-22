import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@ngstarter-ui/components/button';
import { Card, CardContent } from '@ngstarter-ui/components/card';
import {
  Accordion,
  ExpansionPanel,
  ExpansionPanelHeader,
  ExpansionPanelTitle,
} from '@ngstarter-ui/components/expansion';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  Cell,
  CellDef,
  ColumnDef,
  HeaderCell,
  HeaderCellDef,
  HeaderRow,
  HeaderRowDef,
  Row,
  RowDef,
  Table,
} from '@ngstarter-ui/components/table';
import { pricingFaqItems } from '../../seo/seo-data';

@Component({
  selector: 'app-pricing-page',
  imports: [
    Accordion,
    Button,
    Card,
    CardContent,
    ExpansionPanel,
    ExpansionPanelHeader,
    ExpansionPanelTitle,
    Cell,
    CellDef,
    ColumnDef,
    HeaderCell,
    HeaderCellDef,
    HeaderRow,
    HeaderRowDef,
    Icon,
    RouterLink,
    Row,
    RowDef,
    Table,
  ],
  templateUrl: './pricing.html',
  styleUrl: './pricing.scss',
})
export class Pricing {
  readonly comparisonColumns = ['feature', 'standard', 'professional'];

  readonly professionalHighlights = [
    'Unlimited developers',
    'Unlimited projects',
    'Unlimited domains',
    'All UI components and admin templates',
    'Priority GitHub ticket support',
  ];

  readonly comparisonRows = [
    {
      icon: 'fluent:target-arrow-24-regular',
      title: 'Best fit',
      standard: 'Solo developer',
      standardTone: 'neutral',
      professional: 'Team or agency',
      professionalTone: 'positive',
    },
    {
      icon: 'fluent:people-team-24-regular',
      title: 'Developers',
      standard: '1',
      standardTone: 'limited',
      professional: 'Unlimited',
      professionalTone: 'positive',
    },
    {
      icon: 'fluent:folder-24-regular',
      title: 'Projects',
      standard: '1',
      standardTone: 'limited',
      professional: 'Unlimited',
      professionalTone: 'positive',
    },
    {
      icon: 'fluent:globe-24-regular',
      title: 'Domains',
      standard: '1 domain',
      standardTone: 'limited',
      professional: 'Unlimited',
      professionalTone: 'positive',
    },
    {
      icon: 'fluent:apps-24-regular',
      title: 'UI components',
      standard: 'Included',
      standardTone: 'positive',
      professional: 'Included',
      professionalTone: 'positive',
    },
    {
      icon: 'fluent:grid-24-regular',
      title: 'Admin templates',
      standard: 'Included',
      standardTone: 'positive',
      professional: 'Included',
      professionalTone: 'positive',
    },
    {
      icon: 'fluent:code-24-regular',
      title: 'Source code',
      standard: 'Included',
      standardTone: 'positive',
      professional: 'Included',
      professionalTone: 'positive',
    },
    {
      icon: 'fluent:arrow-sync-24-regular',
      title: 'Updates',
      standard: 'Licensed project',
      standardTone: 'neutral',
      professional: 'Every project',
      professionalTone: 'positive',
    },
    {
      icon: 'fluent:person-support-24-regular',
      title: 'Support',
      standard: 'Standard',
      standardTone: 'neutral',
      professional: 'Priority',
      professionalTone: 'positive',
    },
    {
      icon: 'fluent:timer-24-regular',
      title: 'Trial mode',
      standard: '3 months',
      standardTone: 'positive',
      professional: '3 months',
      professionalTone: 'positive',
    },
    {
      icon: 'fluent:receipt-money-24-regular',
      title: 'Price',
      standard: '$29',
      standardTone: 'neutral',
      professional: '$299',
      professionalTone: 'positive',
    },
  ];

  readonly faqs = pricingFaqItems;
}
