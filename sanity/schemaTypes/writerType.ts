import {UsersIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

// DEPRECATED: writers are now authors with "Can sign in to the writer portal" switched on.
// This type is kept only so old records can be read and moved by
// scripts/migrate-writers-to-authors.mjs. It is hidden from the Studio sidebar.
export default defineType({
  name: 'writer',
  title: 'Writer (old)',
  type: 'document',
  icon: UsersIcon,
  deprecated: {
    reason: 'Writers are now authors with writer portal access. Run scripts/migrate-writers-to-authors.mjs.',
  },
  readOnly: true,
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string'}),
    defineField({name: 'author', title: 'Byline author', type: 'reference', to: [{type: 'author'}]}),
    defineField({name: 'active', title: 'Can sign in', type: 'boolean'}),
    defineField({name: 'accessCodeHash', title: 'Invite code', type: 'string', hidden: true}),
  ],
  preview: {
    select: {title: 'name'},
  },
})
