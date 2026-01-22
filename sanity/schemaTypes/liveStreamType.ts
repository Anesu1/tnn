import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'liveStream',
  title: 'Live Stream',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'streamType',
      title: 'Stream Type',
      type: 'string',
    }),
    defineField({
      name: 'streamUrl',
      title: 'Stream URL',
      type: 'url',
    }),
    defineField({
      name: 'embedCode',
      title: 'Embed Code',
      type: 'text',
    }),
    defineField({
      name: 'isLive',
      title: 'Is Live',
      type: 'boolean',
    }),
    defineField({
      name: 'startTime',
      title: 'Start Time',
      type: 'datetime',
    }),
    defineField({
      name: 'endTime',
      title: 'End Time',
      type: 'datetime',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
  ],
});