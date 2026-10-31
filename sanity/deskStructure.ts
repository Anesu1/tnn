import type {StructureResolver} from 'sanity/structure'
import {ClockIcon} from '@sanity/icons'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Drafts written by contributors that the chief editor still needs to publish
      // (includes unpublished edits to stories that are already live)
      S.listItem()
        .title('Awaiting approval')
        .icon(ClockIcon)
        .child(
          S.documentList()
            .title('Awaiting approval')
            .filter('_type == "newsItem" && _id in path("drafts.**")')
            .defaultOrdering([{field: '_updatedAt', direction: 'desc'}]),
        ),
      S.divider(),
      ...S.documentTypeListItems(),
    ])
