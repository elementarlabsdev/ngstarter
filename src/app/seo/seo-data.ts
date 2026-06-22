export type JsonLdObject = Record<string, unknown>;

export type SeoData = {
  title: string;
  description: string;
  canonicalPath: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: JsonLdObject[];
};

export const SITE_URL = 'https://ngstarter.com';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og/ngstarter-og.png`;

const merchantReturnPolicyId = `${SITE_URL}/terms#return-policy`;
const shippingServiceId = `${SITE_URL}/terms#digital-delivery`;

const organizationSchema: JsonLdObject = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'NgStarter',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
  sameAs: ['https://x.com/elementarlabs'],
  hasMerchantReturnPolicy: {
    '@id': merchantReturnPolicyId,
  },
  hasShippingService: {
    '@id': shippingServiceId,
  },
};

const websiteSchema: JsonLdObject = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'NgStarter',
  url: SITE_URL,
  publisher: {
    '@id': `${SITE_URL}/#organization`,
  },
  inLanguage: 'en',
};

const merchantReturnPolicySchema: JsonLdObject = {
  '@type': 'MerchantReturnPolicy',
  '@id': merchantReturnPolicyId,
  merchantReturnLink: `${SITE_URL}/terms`,
};

const shippingServiceSchema: JsonLdObject = {
  '@type': 'ShippingService',
  '@id': shippingServiceId,
  name: 'Digital delivery',
  description: 'NgStarter licenses, source code, and updates are delivered online after purchase.',
  shippingConditions: {
    '@type': 'ShippingConditions',
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: '0',
      currency: 'USD',
    },
  },
};

const offers = [
  {
    '@type': 'Offer',
    name: 'Standard',
    price: '29',
    priceCurrency: 'USD',
    url: `${SITE_URL}/pricing`,
    availability: 'https://schema.org/InStock',
    category: 'Standard License',
    hasMerchantReturnPolicy: {
      '@id': merchantReturnPolicyId,
    },
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      hasShippingService: {
        '@id': shippingServiceId,
      },
    },
  },
  {
    '@type': 'Offer',
    name: 'Professional',
    price: '299',
    priceCurrency: 'USD',
    url: `${SITE_URL}/pricing`,
    availability: 'https://schema.org/InStock',
    category: 'Professional License',
    hasMerchantReturnPolicy: {
      '@id': merchantReturnPolicyId,
    },
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      hasShippingService: {
        '@id': shippingServiceId,
      },
    },
  },
];

const softwareSchema: JsonLdObject = {
  '@type': 'SoftwareApplication',
  '@id': `${SITE_URL}/#software`,
  name: 'NgStarter',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  programmingLanguage: 'TypeScript',
  url: SITE_URL,
  softwareHelp: 'https://docs.ngstarter.com/',
  description:
    'AI-friendly Angular UI components library for admin dashboards, product interfaces, and enterprise Angular apps.',
  offers,
};

const productSchema: JsonLdObject = {
  '@type': 'Product',
  '@id': `${SITE_URL}/#product`,
  name: 'NgStarter',
  brand: {
    '@type': 'Brand',
    name: 'NgStarter',
    url: SITE_URL,
  },
  category: 'Angular UI components library',
  description:
    'Standalone Angular UI components, admin dashboard templates, source code, and themes for production Angular applications.',
  image: DEFAULT_OG_IMAGE,
  offers,
};

export const pricingFaqItems = [
  {
    question: 'Is NgStarter open source?',
    answer:
      'NgStarter is a commercial Angular UI components library. Purchases include private source code access according to the selected license, but the source code may not be published publicly.',
  },
  {
    question: 'Can I use NgStarter in commercial projects?',
    answer:
      'Yes. NgStarter can be used in commercial applications, SaaS products, internal tools, and client projects under the purchased license terms.',
  },
  {
    question: 'Do I get the source code?',
    answer:
      'Yes. Standard and Professional both include source code for the NgStarter UI components and admin dashboard templates for private licensed use. Public source code publishing is not allowed.',
  },
  {
    question: 'Are updates included?',
    answer: 'Yes. Product updates are included according to the purchased plan and license scope.',
  },
  {
    question: 'What support is included?',
    answer:
      'Standard includes GitHub ticket support. Professional includes priority GitHub ticket support for multi-project usage.',
  },
  {
    question: 'How long does trial mode last?',
    answer:
      'Trial mode is available for 3 months. After the trial period ends, you need to purchase a valid Standard or Professional license.',
  },
  {
    question: 'What is included in Standard and Professional?',
    answer:
      'Standard includes unlimited developers, one project, and one domain. Professional includes unlimited developers, unlimited projects, and unlimited domains.',
  },
  {
    question: 'Can I use one license for multiple client projects?',
    answer:
      'Use Professional when you need unlimited projects, domains, or agency client work. Standard is limited to one project and one domain.',
  },
];

export const faqItems = pricingFaqItems;

export const templatesFaqItems = [
  {
    question: 'Can I customize the Angular admin dashboard templates?',
    answer:
      'Yes. The templates include source code through the NgStarter license, so you can adapt layouts, widgets, routes, styles, and data integration for your product. The source code may not be published publicly.',
  },
  {
    question: 'Are the templates included in the NgStarter license?',
    answer:
      'Yes. Standard and Professional both include the Angular admin dashboard templates. Choose Professional for unlimited projects and domains.',
  },
  {
    question: 'Do the templates include source code?',
    answer:
      'Yes. Template source code is included together with the NgStarter UI component source code under the selected commercial license for private use, and it may not be published publicly.',
  },
  {
    question: 'Are the admin templates responsive?',
    answer:
      'Yes. The templates are built with responsive Angular app shell patterns, reusable NgStarter components, and layouts that adapt across desktop and smaller screens.',
  },
  {
    question: 'Do the templates support dark mode?',
    answer:
      'Yes. NgStarter templates are designed around theme tokens and can be used with dark-mode compatible NgStarter themes.',
  },
];

const pricingFaqSchema: JsonLdObject = {
  '@type': 'FAQPage',
  '@id': `${SITE_URL}/pricing#faq`,
  mainEntity: pricingFaqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

const homeFaqSchema: JsonLdObject = {
  '@type': 'FAQPage',
  '@id': `${SITE_URL}/#faq`,
  mainEntity: faqItems.slice(0, 5).map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

const templatesFaqSchema: JsonLdObject = {
  '@type': 'FAQPage',
  '@id': `${SITE_URL}/templates#faq`,
  mainEntity: templatesFaqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

function webPageSchema(path: string, name: string, description: string): JsonLdObject {
  const url = `${SITE_URL}${path}`;

  return {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    isPartOf: {
      '@id': `${SITE_URL}/#website`,
    },
    about: {
      '@id': `${SITE_URL}/#product`,
    },
    inLanguage: 'en',
  };
}

const homeDescription =
  'NgStarter is an AI-friendly Angular components library for admin dashboards, product interfaces, and enterprise Angular apps with standalone, signal-based UI components.';
const pricingDescription =
  'Compare NgStarter Standard and Professional pricing for Angular UI components, admin templates, source code, commercial licenses, support, updates, and trial access.';
const templatesDescription =
  'Explore Angular admin dashboard templates built with NgStarter UI for SaaS, CRM, analytics, and internal tools with source code, charts, responsive layouts, and dark mode.';
const licenseDescription =
  'Read the NgStarter commercial license terms for Standard and Professional Angular UI component library plans.';
const privacyDescription =
  'Read the NgStarter privacy policy for data collection, payments, analytics, and contact information.';
const termsDescription =
  'Read the NgStarter terms of service for purchases, product access, acceptable use, and support.';
const blogDescription =
  'Read practical NgStarter tutorials for building angular admin applications, product dashboards, app layouts, and reusable UI foundations.';
const basicLayoutArticleDescription =
  'Angular admin tutorial: create a basic application layout with NgStarter UI using Layout, Sidenav, Sidebar, Panel, and ScrollbarArea.';
const panelLayoutArticleDescription =
  'Angular panel layout tutorial: create practical admin workspace layouts with ngs-panel, PanelHeader, PanelContent, PanelSidebar, PanelAside, and PanelFooter.';
const formBuilderCustomFieldArticleDescription =
  'NgStarter Form Builder tutorial: add a custom Angular field, register it with provideFormBuilderField, and configure schema-driven inspector settings.';
const formBuilderCustomValidatorArticleDescription =
  'NgStarter Form Builder tutorial: add a custom validator, register it globally, configure field rules, and show custom error messages under rendered controls.';
const formBuilderSchemaArticleDescription =
  'NgStarter Form Builder schema reference: understand sections, fields, layout ordering, validation, settings, and nested field structures.';
const selectDataSourceArticleDescription =
  'NgStarter Select data source tutorial: load options lazily, support remote search and paging, return selected options, and register data sources for Form Builder select fields.';

export const HOME_SEO: SeoData = {
  title: 'NgStarter - AI-Friendly Angular Components Library for Admin Apps',
  description: homeDescription,
  canonicalPath: '/',
  structuredData: [
    organizationSchema,
    websiteSchema,
    merchantReturnPolicySchema,
    shippingServiceSchema,
    softwareSchema,
    productSchema,
    homeFaqSchema,
    webPageSchema(
      '/',
      'NgStarter - AI-Friendly Angular Components Library for Admin Apps',
      homeDescription,
    ),
  ],
};

export const PRICING_SEO: SeoData = {
  title: 'NgStarter Pricing | Angular UI Components & Admin Templates',
  description: pricingDescription,
  canonicalPath: '/pricing',
  structuredData: [
    organizationSchema,
    websiteSchema,
    merchantReturnPolicySchema,
    shippingServiceSchema,
    softwareSchema,
    productSchema,
    pricingFaqSchema,
    webPageSchema(
      '/pricing',
      'NgStarter Pricing - Angular UI Components & Admin Templates',
      pricingDescription,
    ),
  ],
};

export const TEMPLATES_SEO: SeoData = {
  title: 'Angular Admin Dashboard Templates | NgStarter UI',
  description: templatesDescription,
  canonicalPath: '/templates',
  ogImage: `${SITE_URL}/templates/admin-corporate-dashboard.png`,
  structuredData: [
    organizationSchema,
    websiteSchema,
    productSchema,
    templatesFaqSchema,
    webPageSchema(
      '/templates',
      'Angular Admin Dashboard Templates Built with NgStarter UI',
      templatesDescription,
    ),
    {
      '@type': 'SoftwareSourceCode',
      '@id': `${SITE_URL}/templates#corporate-template`,
      name: 'Corporate Admin Dashboard Template',
      description:
        'A sales operations dashboard for pipelines, revenue growth, regional sales, task summaries, and team updates.',
      codeRepository: 'https://github.com/elementarlabsdev/ngstarter',
      runtimePlatform: 'Angular',
      programmingLanguage: 'TypeScript',
      image: `${SITE_URL}/templates/admin-corporate-dashboard.png`,
      url: 'https://admin-corporate.ngstarter.com',
      isPartOf: {
        '@id': `${SITE_URL}/#product`,
      },
    },
    {
      '@type': 'SoftwareSourceCode',
      '@id': `${SITE_URL}/templates#modern-template`,
      name: 'Modern Admin Dashboard Template',
      description:
        'A soft, rounded creative analytics dashboard with responsive sidenav navigation, ECharts-powered widgets, calendar planning, and research signal tracking.',
      codeRepository: 'https://github.com/elementarlabsdev/ngstarter',
      runtimePlatform: 'Angular',
      programmingLanguage: 'TypeScript',
      image: `${SITE_URL}/templates/admin-modern-dashboard.png`,
      url: 'https://admin-modern.ngstarter.com',
      isPartOf: {
        '@id': `${SITE_URL}/#product`,
      },
    },
  ],
};

export const LICENSE_SEO: SeoData = {
  title: 'License | NgStarter',
  description: licenseDescription,
  canonicalPath: '/license',
  structuredData: [
    organizationSchema,
    websiteSchema,
    merchantReturnPolicySchema,
    shippingServiceSchema,
    webPageSchema('/license', 'License | NgStarter', licenseDescription),
  ],
};

export const PRIVACY_SEO: SeoData = {
  title: 'Privacy Policy | NgStarter',
  description: privacyDescription,
  canonicalPath: '/privacy',
  structuredData: [
    organizationSchema,
    websiteSchema,
    webPageSchema('/privacy', 'Privacy Policy | NgStarter', privacyDescription),
  ],
};

export const TERMS_SEO: SeoData = {
  title: 'Terms of Service | NgStarter',
  description: termsDescription,
  canonicalPath: '/terms',
  structuredData: [
    organizationSchema,
    websiteSchema,
    webPageSchema('/terms', 'Terms of Service | NgStarter', termsDescription),
  ],
};

export const BLOG_SEO: SeoData = {
  title: 'Angular Admin Blog | NgStarter UI Tutorials',
  description: blogDescription,
  canonicalPath: '/blog',
  structuredData: [
    organizationSchema,
    websiteSchema,
    webPageSchema('/blog', 'NgStarter Blog', blogDescription),
    {
      '@type': 'Blog',
      '@id': `${SITE_URL}/blog#blog`,
      name: 'NgStarter Blog',
      description: blogDescription,
      url: `${SITE_URL}/blog`,
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      inLanguage: 'en',
    },
  ],
};

export const BASIC_LAYOUT_ARTICLE_SEO: SeoData = {
  title: 'Angular Admin Layout: Build a Basic Application Shell',
  description: basicLayoutArticleDescription,
  canonicalPath: '/blog/basic-application-layout',
  ogType: 'article',
  structuredData: [
    organizationSchema,
    websiteSchema,
    webPageSchema(
      '/blog/basic-application-layout',
      'Angular Admin Layout: Build a Basic Application Shell',
      basicLayoutArticleDescription,
    ),
    {
      '@type': 'BlogPosting',
      '@id': `${SITE_URL}/blog/basic-application-layout#article`,
      headline: 'Angular Admin Layout: Build a Basic Application Shell',
      description: basicLayoutArticleDescription,
      url: `${SITE_URL}/blog/basic-application-layout`,
      datePublished: '2026-06-12',
      dateModified: '2026-06-12',
      author: {
        '@type': 'Organization',
        name: 'NgStarter',
        url: SITE_URL,
      },
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      image: DEFAULT_OG_IMAGE,
      inLanguage: 'en',
      keywords: ['angular admin', 'angular admin layout', 'angular dashboard', 'NgStarter UI'],
      isPartOf: {
        '@id': `${SITE_URL}/blog#blog`,
      },
    },
  ],
};

export const FORM_BUILDER_CUSTOM_FIELD_ARTICLE_SEO: SeoData = {
  title: 'How to Add a Custom Field in Form Builder | NgStarter UI',
  description: formBuilderCustomFieldArticleDescription,
  canonicalPath: '/blog/form-builder-custom-field',
  ogType: 'article',
  structuredData: [
    organizationSchema,
    websiteSchema,
    webPageSchema(
      '/blog/form-builder-custom-field',
      'How to Add and Configure a Custom Field in Form Builder',
      formBuilderCustomFieldArticleDescription,
    ),
    {
      '@type': 'BlogPosting',
      '@id': `${SITE_URL}/blog/form-builder-custom-field#article`,
      headline: 'How to Add and Configure a Custom Field in Form Builder',
      description: formBuilderCustomFieldArticleDescription,
      url: `${SITE_URL}/blog/form-builder-custom-field`,
      datePublished: '2026-06-18',
      dateModified: '2026-06-18',
      author: {
        '@type': 'Organization',
        name: 'NgStarter',
        url: SITE_URL,
      },
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      image: DEFAULT_OG_IMAGE,
      inLanguage: 'en',
      keywords: [
        'form builder',
        'angular form builder',
        'custom angular field',
        'NgStarter UI',
        'schema driven forms',
      ],
      isPartOf: {
        '@id': `${SITE_URL}/blog#blog`,
      },
    },
  ],
};

export const FORM_BUILDER_CUSTOM_VALIDATOR_ARTICLE_SEO: SeoData = {
  title: 'How to Add a Custom Validator to Form Builder | NgStarter UI',
  description: formBuilderCustomValidatorArticleDescription,
  canonicalPath: '/blog/form-builder-custom-validator',
  ogType: 'article',
  structuredData: [
    organizationSchema,
    websiteSchema,
    webPageSchema(
      '/blog/form-builder-custom-validator',
      'How to Add a Custom Validator to Form Builder',
      formBuilderCustomValidatorArticleDescription,
    ),
    {
      '@type': 'BlogPosting',
      '@id': `${SITE_URL}/blog/form-builder-custom-validator#article`,
      headline: 'How to Add a Custom Validator to Form Builder',
      description: formBuilderCustomValidatorArticleDescription,
      url: `${SITE_URL}/blog/form-builder-custom-validator`,
      datePublished: '2026-06-22',
      dateModified: '2026-06-22',
      author: {
        '@type': 'Organization',
        name: 'NgStarter',
        url: SITE_URL,
      },
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      image: DEFAULT_OG_IMAGE,
      inLanguage: 'en',
      keywords: [
        'form builder validator',
        'angular validator',
        'custom angular validator',
        'NgStarter UI',
        'schema driven forms',
      ],
      isPartOf: {
        '@id': `${SITE_URL}/blog#blog`,
      },
    },
  ],
};

export const FORM_BUILDER_SCHEMA_ARTICLE_SEO: SeoData = {
  title: 'Form Builder Schema Explained | NgStarter UI',
  description: formBuilderSchemaArticleDescription,
  canonicalPath: '/blog/form-builder-schema',
  ogType: 'article',
  structuredData: [
    organizationSchema,
    websiteSchema,
    webPageSchema(
      '/blog/form-builder-schema',
      'Form Builder Schema Explained',
      formBuilderSchemaArticleDescription,
    ),
    {
      '@type': 'BlogPosting',
      '@id': `${SITE_URL}/blog/form-builder-schema#article`,
      headline: 'Form Builder Schema Explained',
      description: formBuilderSchemaArticleDescription,
      url: `${SITE_URL}/blog/form-builder-schema`,
      datePublished: '2026-06-18',
      dateModified: '2026-06-18',
      author: {
        '@type': 'Organization',
        name: 'NgStarter',
        url: SITE_URL,
      },
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      image: DEFAULT_OG_IMAGE,
      inLanguage: 'en',
      keywords: [
        'FormBuilderSchema',
        'angular json forms',
        'schema driven forms',
        'angular form schema',
        'NgStarter UI',
      ],
      isPartOf: {
        '@id': `${SITE_URL}/blog#blog`,
      },
    },
  ],
};

export const SELECT_DATA_SOURCE_ARTICLE_SEO: SeoData = {
  title: 'Select Data Sources in NgStarter UI | Form Builder Select',
  description: selectDataSourceArticleDescription,
  canonicalPath: '/blog/select-data-source',
  ogType: 'article',
  structuredData: [
    organizationSchema,
    websiteSchema,
    webPageSchema(
      '/blog/select-data-source',
      'Select data sources in NgStarter UI',
      selectDataSourceArticleDescription,
    ),
    {
      '@type': 'BlogPosting',
      '@id': `${SITE_URL}/blog/select-data-source#article`,
      headline: 'Select data sources in NgStarter UI',
      description: selectDataSourceArticleDescription,
      url: `${SITE_URL}/blog/select-data-source`,
      datePublished: '2026-06-19',
      dateModified: '2026-06-19',
      author: {
        '@type': 'Organization',
        name: 'NgStarter',
        url: SITE_URL,
      },
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      image: DEFAULT_OG_IMAGE,
      inLanguage: 'en',
      keywords: [
        'NgStarter Select',
        'Angular select data source',
        'remote select search',
        'Form Builder select',
        'schema driven forms',
      ],
      isPartOf: {
        '@id': `${SITE_URL}/blog#blog`,
      },
    },
  ],
};

export const PANEL_LAYOUT_ARTICLE_SEO: SeoData = {
  title: 'Angular Panel Layout: Create Admin Workspaces with ngs-panel',
  description: panelLayoutArticleDescription,
  canonicalPath: '/blog/angular-panel-layout',
  ogType: 'article',
  structuredData: [
    organizationSchema,
    websiteSchema,
    webPageSchema(
      '/blog/angular-panel-layout',
      'Angular Panel Layout: Create Admin Workspaces with ngs-panel',
      panelLayoutArticleDescription,
    ),
    {
      '@type': 'BlogPosting',
      '@id': `${SITE_URL}/blog/angular-panel-layout#article`,
      headline: 'Angular Panel Layout: Create Admin Workspaces with ngs-panel',
      description: panelLayoutArticleDescription,
      url: `${SITE_URL}/blog/angular-panel-layout`,
      datePublished: '2026-06-12',
      dateModified: '2026-06-12',
      author: {
        '@type': 'Organization',
        name: 'NgStarter',
        url: SITE_URL,
      },
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      image: DEFAULT_OG_IMAGE,
      inLanguage: 'en',
      keywords: [
        'angular panel layout',
        'ngs-panel',
        'angular admin panel',
        'angular workspace layout',
        'NgStarter UI',
      ],
      isPartOf: {
        '@id': `${SITE_URL}/blog#blog`,
      },
    },
  ],
};
