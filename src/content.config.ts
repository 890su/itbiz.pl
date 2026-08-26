import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    translationKey: z.string(),
    locale: z.enum(['pl', 'ru', 'en', 'uk']),
    serviceId: z.string(),
    title: z.string(),
    breadcrumbTitle: z.string().optional(),
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
    primaryCta: z.string().optional(),
    heroFacts: z.array(z.string()).min(2).max(4).optional(),
    serviceNoteTitle: z.string().optional(),
    serviceNote: z.string().optional(),
    processLabel: z.string().optional(),
    processTitle: z.string().optional(),
    processLead: z.string().optional(),
    process: z
      .array(
        z.object({
          label: z.string(),
          title: z.string(),
          description: z.string(),
        }),
      )
      .min(3)
      .max(4)
      .optional(),
    formLead: z.string().optional(),
    messageHelp: z.string().optional(),
    submitLabel: z.string().optional(),
  }),
});

export const collections = { services };
