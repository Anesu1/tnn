import { TagsIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

// Tags group stories about the same person, place, organisation or running story. The website
// uses shared tags to choose related stories, and they go into each story's search keywords.
export default defineType({
  name: 'tag',
  title: 'Tag',
  type: 'document',
  icon: TagsIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Name',
      type: 'string',
      description: 'A person, place, organisation or running story, written as readers would search for it, e.g. “Uebert Angel”, “ZESA”.',
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title', id: '_id' },
  },
  orderings: [{ title: 'Name', name: 'name', by: [{ field: 'title', direction: 'asc' }] }],
})
