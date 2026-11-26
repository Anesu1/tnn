import { PlayIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

// A recurring TNN video programme (Girls' Chat ZW, Nation Watch…). Each has its own page at
// /watch/<slug> listing its episodes.
export const programmeType = defineType({
  name: 'programme',
  title: 'Programme',
  type: 'document',
  icon: PlayIcon,
  fields: [
    defineField({ name: 'title', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description: 'The page is /watch/<this>. Don’t change it once the page is live.',
      options: { source: 'title', maxLength: 64 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'About the programme',
      type: 'text',
      rows: 4,
      description: 'Two or three sentences: what the programme covers and who it is for. Shown on its page and in search results.',
      validation: (Rule) => Rule.max(400).warning('Keep it short; long text belongs in episode notes'),
    }),
    defineField({
      name: 'presenters',
      title: 'Presenters',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'schedule',
      title: 'When new episodes come out',
      type: 'string',
      description: 'Optional, e.g. “New episodes every Thursday”. Only fill this in if it is reliable.',
    }),
    defineField({
      name: 'youtubePlaylist',
      title: 'YouTube playlist',
      type: 'url',
      validation: (Rule) => Rule.uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'order',
      title: 'Order on Watch TNN',
      type: 'number',
      description: '1 shows first',
      validation: (Rule) => Rule.integer().min(1),
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'schedule' } },
})
