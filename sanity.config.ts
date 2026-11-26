'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `\app\studio\[[...tool]]\page.tsx` route
 */

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'
import { structure } from './sanity/deskStructure'
import { withPublishedAt } from './sanity/actions/setPublishedAt'
import { StartHere } from './sanity/components/StartHere'
import { HelpCircleIcon } from '@sanity/icons'

export default defineConfig({
  title: 'TNN Studio',
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  // "Help" in the top bar, next to Structure: ask how to do something, from anywhere in the Studio
  tools: (prev) => [...prev, { name: 'help', title: 'Help', icon: HelpCircleIcon, component: StartHere }],
  plugins: [
    structureTool({ structure }),
    // Vision (GROQ queries) is a developer tool: only on a developer's own computer, not in the
    // live Studio the newsroom uses
    ...(process.env.NODE_ENV === 'development' ? [visionTool({ defaultApiVersion: apiVersion })] : []),
  ],
  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'newsItem') {
        return prev.map((action) => (action.action === 'publish' ? withPublishedAt(action) : action))
      }
      // The six sections are fixed in the website's code: they can be edited, not added or removed
      if (context.schemaType === 'category') {
        return prev.filter((action) => !['delete', 'duplicate', 'unpublish'].includes(action.action ?? ''))
      }
      return prev
    },
    newDocumentOptions: (prev) => prev.filter((item) => item.templateId !== 'category'),
  },
})
