import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero.component';
import { FeaturesComponent } from '../../components/features/features.component';
import { PreviewComponent } from '../../components/preview/preview.component';
import { FaqComponent } from '../../components/faq/faq.component';

@Component({
  selector: 'app-home',
  imports: [
    HeroComponent,
    FeaturesComponent,
    PreviewComponent,
    FaqComponent,
  ],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.scss',
})
export class Home {
  readonly docsCategories = [
    {
      title: 'Forms',
      href: 'https://docs.ngstarter.com/forms',
      icon: 'fluent:form-24-regular',
      description: 'Inputs, selects, validation, masks, toggles, and schema-driven forms.',
    },
    {
      title: 'Data',
      href: 'https://docs.ngstarter.com/libraries/data-view',
      icon: 'fluent:table-24-regular',
      description: 'Data View, tables, filtering, pagination, sorting, and server-side records.',
    },
    {
      title: 'Navigation',
      href: 'https://docs.ngstarter.com/navigation',
      icon: 'fluent:navigation-24-regular',
      description: 'Sidebars, breadcrumbs, rail navigation, tabs, and product dashboard shells.',
    },
    {
      title: 'Micro Charts',
      href: 'https://docs.ngstarter.com/micro-charts',
      icon: 'fluent:chart-multiple-24-regular',
      description: 'Compact line, bar, and pie charts for KPI cards and dense dashboards.',
    },
  ];
}
