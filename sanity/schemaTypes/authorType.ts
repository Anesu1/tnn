import {UserIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

import {AccessCodeInput} from '../components/AccessCodeInput'

// One record per person: their public byline profile, plus optional access to the
// /write portal. Their email and password hash are kept in private
// "writerAccount.<authorId>" documents (see lib/writer-auth.ts).
export default defineType({
  name: 'author',
  title: 'Reporter',
  type: 'document',
  icon: UserIcon,
  fieldsets: [
    {
      name: 'portal',
      title: 'Writer portal',
      description: 'Let this person submit stories at /write for you to review and publish',
      options: {collapsible: true, collapsed: false},
    },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      description: 'Their page: thenarrativenetwork.org/authors/... Click Generate. Don’t change it later.',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      description: 'Two or three sentences on their beat and experience, shown on their author page. Helps readers and Google trust the byline.',
      of: [{type: 'block', styles: [{title: 'Normal', value: 'normal'}], lists: []}],
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      description: 'A clear head-and-shoulders photo, at least 400px square. Shown on their author page.',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Photo description',
          type: 'string',
          description: 'Leave empty to use their name.',
        }),
      ],
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'Shown with their name, e.g. “Senior Reporter”, “Correspondent, Bulawayo”, “Contributor”.',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {list: ['X', 'Facebook', 'Instagram', 'LinkedIn', 'TikTok', 'YouTube', 'Threads', 'Website']},
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'Link',
              type: 'url',
              validation: (Rule) => Rule.required().uri({scheme: ['https', 'http']}),
            }),
          ],
          preview: {select: {title: 'platform', subtitle: 'url'}},
        },
      ],
    }),
    defineField({
      name: 'portalAccess',
      title: 'Can sign in to the writer portal',
      type: 'boolean',
      fieldset: 'portal',
      description: 'Turn off to remove their access immediately. Their published stories stay live.',
      initialValue: false,
    }),
    defineField({
      name: 'accessCodeHash',
      title: 'Invite code',
      type: 'string',
      fieldset: 'portal',
      components: {input: AccessCodeInput},
      hidden: ({document}) => !document?.portalAccess,
      validation: (Rule) =>
        Rule.custom((hash, context) =>
          context.document?.portalAccess && !hash ? 'Generate an invite code so they can set up their account' : true,
        ),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      role: 'role',
      portalAccess: 'portalAccess',
      media: 'photo',
    },
    prepare: ({title, role, portalAccess, media}) => ({
      title,
      subtitle: [role, portalAccess && 'Writer portal'].filter(Boolean).join(' · ') || undefined,
      media,
    }),
  },
})
