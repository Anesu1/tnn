import { TagIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

// The six editorial sections. The website's section pages, menu and order come from SECTIONS in
// lib/site/config.ts, matched on the key below, so sections can't be added or deleted in the
// Studio (sanity.config.ts), and the key and slug are locked. Breaking news is a switch on each
// story, not a section.
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
  title: 'Section',
  type: 'document',
  icon: TagIcon,

  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) =>
        Rule.required().custom((value) =>
          value && !fixedCategories.includes(value) ? `Must be one of the six sections: ${fixedCategories.join(', ')}` : true,
        ),
    }),
    defineField({
      name: 'key',
      title: 'Internal key',
      type: 'string',
      description: 'Links this section to the website’s section page. Locked: changing it would empty the page.',
      readOnly: true,
      hidden: true,
      validation: (Rule) => Rule.required().regex(/^[a-z0-9-]+$/),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      readOnly: true,
      hidden: true,
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      description: 'For editors: what belongs in this section.',
      validation: (Rule) => Rule.required(),
    }),
  ],

  preview: {
    select: { title: 'title', subtitle: 'description' },
  },
})
