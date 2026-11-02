import {UserIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

import {AccessCodeInput} from '../components/AccessCodeInput'

// One record per person: their public byline profile, plus optional access to the
// /write portal. Their email and password hash are kept in private
// "writerAccount.<authorId>" documents (see lib/writer-auth.ts).
export default defineType({
  name: 'author',
  title: 'Author',
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
      title: 'Slug',
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
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
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
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
            }),
          ],
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
