import { company } from '../data/company';

export const organizationId = 'https://itbiz.pl/#organization';
export const websiteId = 'https://itbiz.pl/#website';

export const organizationSchema = {
  '@type': 'Organization',
  '@id': organizationId,
  name: company.legalName,
  legalName: company.legalName,
  alternateName: company.brand,
  taxID: company.nip,
  url: 'https://itbiz.pl/',
  image: 'https://itbiz.pl/assets/share-itbiz-v1.png',
  telephone: company.publicPhone,
  email: company.publicEmail,
};

// JSON escaping alone does not protect an HTML script element's closing tag.
export const serializeStructuredData = (value: unknown) =>
  JSON.stringify(value).replaceAll('<', '\\u003c');
