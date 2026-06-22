import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@ngstarter-ui/components/button';
import { Card, CardContent } from '@ngstarter-ui/components/card';
import { Chip, ChipSet } from '@ngstarter-ui/components/chips';
import {
  Accordion,
  ExpansionPanel,
  ExpansionPanelHeader,
  ExpansionPanelTitle,
} from '@ngstarter-ui/components/expansion';
import { Icon } from '@ngstarter-ui/components/icon';
import { templatesFaqItems } from '../../seo/seo-data';

@Component({
  selector: 'app-templates',
  imports: [
    Accordion,
    Button,
    Card,
    CardContent,
    Chip,
    ChipSet,
    ExpansionPanel,
    ExpansionPanelHeader,
    ExpansionPanelTitle,
    Icon,
    RouterLink,
  ],
  templateUrl: './templates.html',
  styleUrl: './templates.scss',
})
export class Templates {
  readonly screenshots = [
    {
      title: 'Corporate Admin Dashboard Template',
      description:
        'Revenue operations dashboard with pipeline, regional sales, task summary, recent activity, and team updates.',
      image: '/templates/admin-corporate-dashboard.png',
      alt: 'Corporate Angular admin dashboard template showing revenue operations widgets, sales pipeline, regional sales, task summary, and activity feed',
      href: 'https://admin-corporate.ngstarter.com',
      width: 2880,
      height: 2200,
    },
    {
      title: 'Modern Admin Dashboard Template',
      description:
        'Creative analytics dashboard with responsive navigation, ECharts widgets, calendar planning, and research signals.',
      image: '/templates/admin-modern-dashboard.png',
      alt: 'Modern Angular admin dashboard template showing creative studio analytics, calendar planning, generation latency, model spend, and research signal widgets',
      href: 'https://admin-modern.ngstarter.com',
      width: 1984,
      height: 1250,
    },
  ];

  readonly useCases = [
    {
      icon: 'fluent:building-shop-24-regular',
      title: 'SaaS admin dashboards',
      text: 'Ship tenant portals, billing dashboards, onboarding flows, user management, and product operations screens faster.',
    },
    {
      icon: 'fluent:people-team-24-regular',
      title: 'CRM and sales workspaces',
      text: 'Model pipelines, accounts, regional performance, activities, tasks, and customer health views with reusable Angular UI.',
    },
    {
      icon: 'fluent:chart-multiple-24-regular',
      title: 'Analytics applications',
      text: 'Combine KPI cards, ECharts panels, supporting tables, micro trends, timelines, and filterable reporting sections.',
    },
    {
      icon: 'fluent:toolbox-24-regular',
      title: 'Internal tools',
      text: 'Create approval consoles, support back offices, content operations tools, and team dashboards with production shell patterns.',
    },
  ];

  readonly included = [
    'Dashboard overview pages',
    'Responsive sidenav app shell',
    'Revenue and growth KPI cards',
    'Sales pipeline and task widgets',
    'Regional sales and activity panels',
    'Calendar and planning widgets',
    'Research signal cards',
    'ECharts metric visualizations',
    'Reusable NgStarter component composition',
    'Dark mode compatible theme structure',
    'Responsive desktop and mobile layouts',
    'SEO route metadata patterns',
  ];

  readonly technologies = [
    'Standalone Angular components',
    'Angular signal APIs',
    'NgStarter cards, lists, chips, buttons, side navigation, and layout primitives',
    'ECharts dashboard widgets',
    'Private commercial source code included with NgStarter plans',
  ];

  readonly dashboardComponents = [
    {
      title: 'Layout',
      href: 'https://docs.ngstarter.com/components/layout',
      icon: 'fluent:layout-column-two-24-regular',
      description: 'Root app shells, viewport regions, and dashboard workspace structure.',
    },
    {
      title: 'Sidenav',
      href: 'https://docs.ngstarter.com/components/sidenav',
      icon: 'fluent:panel-left-24-regular',
      description: 'Responsive side navigation, collapsed states, and admin app rails.',
    },
    {
      title: 'Sidebar',
      href: 'https://docs.ngstarter.com/navigation/sidebar',
      icon: 'fluent:navigation-24-regular',
      description: 'Primary admin navigation with icons, badges, groups, and active states.',
    },
    {
      title: 'Card',
      href: 'https://docs.ngstarter.com/components/card',
      icon: 'fluent:card-ui-24-regular',
      description: 'Metric panels, dashboard widgets, and repeated content surfaces.',
    },
    {
      title: 'Data View',
      href: 'https://docs.ngstarter.com/libraries/data-view',
      icon: 'fluent:table-24-regular',
      description: 'Operational data grids with sorting, selection, pagination, and server data.',
    },
    {
      title: 'Micro Charts',
      href: 'https://docs.ngstarter.com/micro-charts',
      icon: 'fluent:chart-multiple-24-regular',
      description: 'Compact dashboard trends and comparisons for KPI-heavy screens.',
    },
  ];

  readonly faqs = templatesFaqItems;
}
