import { VideoIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

const HARARE_TIME = { displayTimeZone: 'Africa/Harare', allowTimeZoneSwitch: false, timeStep: 5 }

// One episode or video. Gets its own page at /watch/<programme>/<slug> with the video, summary,
// guests, notes and related stories, so it can be found in search, not only on YouTube.
export const episodeType = defineType({
  name: 'episode',
  title: 'Episode',
  type: 'document',
  icon: VideoIcon,
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'programme',
      title: 'Programme',
      type: 'reference',
      to: [{ type: 'programme' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube link',
      type: 'url',
      validation: (Rule) =>
        Rule.required().custom((url) =>
          !url || /^https:\/\/(www\.)?(youtube\.com\/(watch\?v=|live\/|shorts\/)|youtu\.be\/)[\w-]{11}/.test(url)
            ? true
            : 'Paste the YouTube link of the video (youtube.com/watch?v=… or youtu.be/…)',
        ),
    }),
    defineField({
      name: 'publishedAt',
      title: 'First shown',
      type: 'datetime',
      options: HARARE_TIME,
      description: 'When the video was released (the date on YouTube). Needed for Google’s video results.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: 'One or two sentences on what the episode covers. Shown on cards and in search results.',
      validation: (Rule) => Rule.required().max(300).warning('Cards show about 180 characters'),
    }),
    defineField({
      name: 'guests',
      title: 'Guests',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'notes',
      title: 'Episode notes or transcript',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Key points, quotes or a transcript. Text helps the episode be found in search and makes it accessible.',
    }),
    defineField({
      name: 'relatedStories',
      title: 'Related stories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'newsItem' }] }],
      description: 'TNN articles on the same subject. They link to this episode too.',
    }),
  ],
  orderings: [{ title: 'Newest first', name: 'newest', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', programme: 'programme.title', date: 'publishedAt' },
    prepare: ({ title, programme, date }) => ({
      title,
      subtitle: [programme, date && new Date(date).toLocaleDateString('en-GB', { timeZone: 'Africa/Harare' })].filter(Boolean).join(' · '),
    }),
  },
})
