import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Card, CardContent } from '@ngstarter-ui/components/card';
import { Chip, ChipSet } from '@ngstarter-ui/components/chips';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-blog',
  imports: [Card, CardContent, Chip, ChipSet, Icon, RouterLink],
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
})
export class Blog {
  readonly articles = [
    {
      title: 'Form Builder steps and external steppers',
      description:
        'Understand renderer-owned steps, runtime flow config, external steppers, shared FormGroup requirements, and when a multi-step UI is still one form.',
      href: '/blog/form-builder-external-stepper',
      date: 'July 1, 2026',
      readTime: '10 min',
      category: 'Form Builder',
      icon: 'fluent:step-24-regular',
    },
    {
      title: 'Calculated fields and expressions in Form Builder',
      description:
        'Use readonly calculated fields, Excel-like expressions, field references, dependency order, type coercion, and custom calculation engines.',
      href: '/blog/form-builder-calculated-field',
      date: 'June 29, 2026',
      readTime: '14 min',
      category: 'Form Builder',
      icon: 'fluent:calculator-24-regular',
    },
    {
      title: 'How to add a custom validator to Form Builder',
      description:
        'Register a global Form Builder validator, configure it in the Validators tab, and show custom error messages below rendered fields.',
      href: '/blog/form-builder-custom-validator',
      date: 'June 22, 2026',
      readTime: '8 min',
      category: 'Form Builder',
      icon: 'fluent:shield-checkmark-24-regular',
    },
    {
      title: 'Select data sources in NgStarter UI',
      description:
        'Load select options lazily, support remote search and paging, and register the same data source for Form Builder select fields.',
      href: '/blog/select-data-source',
      date: 'June 19, 2026',
      readTime: '8 min',
      category: 'Select',
      icon: 'fluent:database-search-24-regular',
    },
    {
      title: 'How to add and configure a custom field in Form Builder',
      description:
        'Register a custom field, render it with Angular reactive forms, and expose schema-driven settings in the NgStarter Form Builder inspector.',
      href: '/blog/form-builder-custom-field',
      date: 'June 18, 2026',
      readTime: '10 min',
      category: 'Form Builder',
      icon: 'fluent:form-new-24-regular',
    },
    {
      title: 'Form Builder schema explained',
      description:
        'Understand FormBuilderSchema, sections, fields, layout ordering, validation, custom settings, and nested form structures.',
      href: '/blog/form-builder-schema',
      date: 'June 18, 2026',
      readTime: '9 min',
      category: 'Form Builder',
      icon: 'fluent:document-data-24-regular',
    },
    {
      title: 'Angular Panel Layout: Create Admin Workspaces with ngs-panel',
      description:
        'Learn angular panel layout patterns for admin screens: single workspaces, master-detail pages, side inspectors, and footer actions with ngs-panel.',
      href: '/blog/angular-panel-layout',
      date: 'June 12, 2026',
      readTime: '9 min',
      category: 'Angular Panel Layout',
      icon: 'fluent:panel-right-24-regular',
    },
    {
      title: 'Angular Admin Layout: Build a Basic Shell with NgStarter UI',
      description:
        'Build an angular admin shell step by step with a root layout, sidenav, sidebar, panel header, scrollable content, and workspace.',
      href: '/blog/basic-application-layout',
      date: 'June 12, 2026',
      readTime: '8 min',
      category: 'Angular Admin',
      icon: 'fluent:layout-column-two-24-regular',
    },
  ];
}
