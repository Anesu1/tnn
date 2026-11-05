import { TagIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

// The six editorial sections. Keep in sync with SECTIONS in lib/site/config.ts, which decides
// the public section pages. Breaking news is a switch on each story, not a section.
const fixedCategories = [
  'Politics & Governance',
  'Business & Economy',
  'Health & Education',
  'Community & Society',
  'Sports & Culture',
  'Entertainment & Lifestyle',
]

export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: TagIcon,

  fields: [
    // Editorial title
    defineField({
      name: 'title',
      type: 'string',
      validation: Rule =>
        Rule.required().custom(value => {
          if (value && !fixedCategories.includes(value)) {
            return `Title must be one of the fixed categories: ${fixedCategories.join(', ')}`
          }
          return true
        }),
    }),

    // Internal stable key (important for logic)
    defineField({
      name: 'key',
      title: 'Internal Key',
      type: 'string',
      description: 'Used in code (e.g. breaking-news, politics-governance, business-economy)',
      validation: Rule => Rule.required().regex(/^[a-z0-9-]+$/, {
        name: 'slug',
        invert: false,
      }),
    }),

    // URL slug
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    }),

    // Editorial description
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.required(),
    }),

    // Visual identity
    defineField({
      name: 'color',
      title: 'Category Color',
      type: 'string',
      description: 'Hex color (e.g. #e11d48)',
    }),

    // Homepage / navigation
    defineField({
      name: 'featured',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: true,
    }),

    defineField({
      name: 'order',
      type: 'number',
      description: 'Controls menu & homepage order',
    }),

    // SEO
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      options: { collapsible: true },
      fields: [
        { name: 'metaTitle', type: 'string' },
        { name: 'metaDescription', type: 'text' },
      ],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
    },
  },
})
