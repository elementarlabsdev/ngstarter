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
  sameAs: [
    'https://x.com/elementarlabs',
  ],
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
  description: 'AI-friendly Angular UI components library for admin dashboards, product interfaces, and enterprise Angular apps.',
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
  description: 'Standalone Angular UI components, admin dashboard templates, source code, and themes for production Angular applications.',
  image: DEFAULT_OG_IMAGE,
  offers,
};

export const faqItems = [
  {
    question: 'Is NgStarter open source?',
    answer: 'NgStarter is a commercial Angular UI components library. Purchases include source code access according to the selected license.',
  },
  {
    question: 'Can I use NgStarter in commercial projects?',
    answer: 'Yes. NgStarter can be used in commercial applications, SaaS products, internal tools, and client projects under the purchased license terms.',
  },
  {
    question: 'How long does trial mode last?',
    answer: 'Trial mode is available for 3 months. After the trial period ends, you need to purchase a valid Standard or Professional license.',
  },
  {
    question: 'What is included in Standard and Professional?',
    answer: 'Standard includes one developer, one project, and one domain. Professional includes unlimited developers, unlimited projects, and unlimited domains.',
  },
  {
    question: 'Do I get the source code?',
    answer: 'Yes. Both pricing plans include source code for the NgStarter UI components and admin dashboards.',
  },
];

const faqSchema: JsonLdObject = {
  '@type': 'FAQPage',
  '@id': `${SITE_URL}/#faq`,
  mainEntity: faqItems.map((item) => ({
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

const homeDescription = 'NgStarter is an AI-friendly Angular components library for admin dashboards, product interfaces, and enterprise Angular apps with standalone, signal-based UI components.';
const pricingDescription = 'Compare NgStarter Standard and Professional pricing for Angular UI components, admin dashboards, source code, support, projects, developers, and domains.';
const templatesDescription = 'Explore NgStarter Angular admin templates, starting with the Corporate dashboard template for sales pipelines, revenue reporting, regional performance, tasks, and team updates.';
const licenseDescription = 'Read the NgStarter commercial license terms for Standard and Professional Angular UI component library plans.';
const privacyDescription = 'Read the NgStarter privacy policy for data collection, payments, analytics, and contact information.';
const termsDescription = 'Read the NgStarter terms of service for purchases, product access, acceptable use, and support.';

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
    faqSchema,
    webPageSchema('/', 'NgStarter - AI-Friendly Angular Components Library for Admin Apps', homeDescription),
  ],
};

export const PRICING_SEO: SeoData = {
  title: 'Pricing | NgStarter Angular UI Components',
  description: pricingDescription,
  canonicalPath: '/pricing',
  structuredData: [
    organizationSchema,
    websiteSchema,
    merchantReturnPolicySchema,
    shippingServiceSchema,
    productSchema,
    webPageSchema('/pricing', 'Pricing | NgStarter Angular UI Components', pricingDescription),
  ],
};

export const TEMPLATES_SEO: SeoData = {
  title: 'Angular Admin Templates | NgStarter',
  description: templatesDescription,
  canonicalPath: '/templates',
  ogImage: `${SITE_URL}/templates/admin-corporate-dashboard.png`,
  structuredData: [
    organizationSchema,
    websiteSchema,
    productSchema,
    webPageSchema('/templates', 'Angular Admin Templates | NgStarter', templatesDescription),
    {
      '@type': 'SoftwareSourceCode',
      '@id': `${SITE_URL}/templates#corporate-template`,
      name: 'Corporate Admin Dashboard Template',
      description: templatesDescription,
      codeRepository: 'https://github.com/elementarlabsdev/ngstarter',
      runtimePlatform: 'Angular',
      programmingLanguage: 'TypeScript',
      image: `${SITE_URL}/templates/admin-corporate-dashboard.png`,
      url: 'https://admin-corporate.ngstarter.com',
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
