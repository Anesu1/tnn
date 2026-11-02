import type {StructureResolver} from 'sanity/structure'
import {ClockIcon, UndoIcon, WarningOutlineIcon} from '@sanity/icons'

// Published stories missing what newsItemType now requires before publishing
const NEEDS_ATTENTION_FILTER = `_type == "newsItem" && !(_id in path("drafts.**")) && (
  !defined(author) ||
  count(coalesce(categories, [])) == 0 ||
  !defined(excerpt) || excerpt == "" ||
  (defined(mainImage.asset) && (!defined(mainImage.alt) || mainImage.alt == ""))
)`

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
            .filter('_type == "newsItem" && _id in path("drafts.**") && reviewStatus != "changesRequested"')
            .defaultOrdering([{field: '_updatedAt', direction: 'desc'}]),
        ),
      S.listItem()
        .title('Sent back to writers')
        .icon(UndoIcon)
        .child(
          S.documentList()
            .title('Sent back to writers')
            .filter('_type == "newsItem" && _id in path("drafts.**") && reviewStatus == "changesRequested"')
            .defaultOrdering([{field: '_updatedAt', direction: 'desc'}]),
        ),
      S.listItem()
        .title('Needs attention')
        .icon(WarningOutlineIcon)
        .child(
          S.documentList()
            .title('Missing byline, section, summary or photo description')
            .filter(NEEDS_ATTENTION_FILTER)
            .defaultOrdering([{field: 'publishedAt', direction: 'desc'}]),
        ),
      S.divider(),
      // "writer" is the old separate login record, replaced by portal access on authors.
      // It stays registered only so scripts/migrate-writers-to-authors.mjs can move old records.
      ...S.documentTypeListItems().filter((item) => item.getId() !== 'writer'),
    ])
