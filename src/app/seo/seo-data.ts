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

const organizationSchema: JsonLdObject = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'NgStarter',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
  sameAs: [
    'https://x.com/elementarlabs',
  ],
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

const offers = [
  {
    '@type': 'Offer',
    name: 'Standard',
    price: '29',
    priceCurrency: 'USD',
    url: `${SITE_URL}/pricing`,
    availability: 'https://schema.org/InStock',
    category: 'Standard License',
  },
  {
    '@type': 'Offer',
    name: 'Professional',
    price: '299',
    priceCurrency: 'USD',
    url: `${SITE_URL}/pricing`,
    availability: 'https://schema.org/InStock',
    category: 'Professional License',
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
    '@id': `${SITE_URL}/#organization`,
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
    question: 'What is included in Standard and Professional?',
    answer: 'Standard includes one developer, one project, and one domain. Professional includes unlimited developers, unlimited projects, and unlimited domains.',
  },
  {
    question: 'Does NgStarter support standalone Angular components?',
    answer: 'Yes. NgStarter components are standalone Angular components built for modern Angular applications with signals and strict TypeScript APIs.',
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
    productSchema,
    webPageSchema('/pricing', 'Pricing | NgStarter Angular UI Components', pricingDescription),
  ],
};

export const LICENSE_SEO: SeoData = {
  title: 'License | NgStarter',
  description: licenseDescription,
  canonicalPath: '/license',
  structuredData: [
    organizationSchema,
    websiteSchema,
    productSchema,
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
