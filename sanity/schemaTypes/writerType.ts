import {UsersIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

import {AccessCodeInput} from '../components/AccessCodeInput'

// People invited to submit stories through the /write portal.
// They never get a Sanity account: the chief editor reviews and publishes their drafts.
// Their email and password hash are kept in private "writerAccount.<id>" documents (see lib/writer-auth.ts).
export default defineType({
  name: 'writer',
  title: 'Writer',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Byline author',
      type: 'reference',
      to: [{type: 'author'}],
      description: 'Stories this writer submits are credited to this author',
    }),
    defineField({
      name: 'active',
      title: 'Can sign in',
      type: 'boolean',
      description: 'Turn off to remove this writer’s access immediately',
      initialValue: true,
    }),
    defineField({
      name: 'accessCodeHash',
      title: 'Invite code',
      type: 'string',
      components: {input: AccessCodeInput},
      validation: (Rule) => Rule.required().error('Generate an invite code for this writer'),
    }),
  ],
  preview: {
    select: {title: 'name', active: 'active'},
    prepare: ({title, active}) => ({
      title,
      subtitle: active === false ? 'Access removed' : 'Can sign in',
    }),
  },
})
