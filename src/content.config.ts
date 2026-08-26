import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    translationKey: z.string(),
    locale: z.literal('pl'),
    serviceId: z.string(),
    title: z.string(),
    seoTitle: z.string(),
    description: z.string(),
    eyebrow: z.string(),
    lead: z.string(),
    status: z.enum(['draft', 'published']),
    noindex: z.boolean().default(true),
    adEligible: z.literal(false),
    b2bOnly: z.literal(true),
    updatedAt: z.coerce.date(),
    outcomes: z.array(z.string()).min(2).max(4),
    problems: z.array(z.string()).min(2),
    scope: z.array(z.string()).min(2),
    exclusions: z.array(z.string()).min(1),
    deliverables: z.array(z.string()).min(2),
    formOption: z.string(),
  }),
});

export const collections = { services };
