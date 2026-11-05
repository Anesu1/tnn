import type {StructureResolver} from 'sanity/structure'
import {ArchiveIcon, BoltIcon, ClockIcon, HomeIcon, StarIcon, UndoIcon, UserIcon, UsersIcon, WarningOutlineIcon} from '@sanity/icons'

// Published stories missing what newsItemType now requires before publishing
const NEEDS_ATTENTION_FILTER = `_type == "newsItem" && !(_id in path("drafts.**")) && (
  !defined(author) ||
  count(coalesce(categories, [])) == 0 ||
  !defined(region) ||
  !defined(excerpt) || excerpt == "" ||
  (defined(mainImage.asset) && (!defined(mainImage.alt) || mainImage.alt == ""))
)`

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // What the homepage shows above Latest news, as set in each story's Homepage placement
      S.listItem()
        .title('Homepage')
        .icon(HomeIcon)
        .child(
          S.list()
            .title('Homepage')
            .items([
              S.listItem()
                .title('Lead and top stories')
                .icon(StarIcon)
                .child(
                  S.documentList()
                    .title('Lead and top stories')
                    .filter(
                      '_type == "newsItem" && !(_id in path("drafts.**")) && placement in ["lead", "top"] && (!defined(featuredUntil) || dateTime(featuredUntil) > dateTime(now()))',
                    )
                    .defaultOrdering([{field: 'placement', direction: 'asc'}, {field: 'topOrder', direction: 'asc'}]),
                ),
              S.listItem()
                .title('Breaking now')
                .icon(BoltIcon)
                .child(
                  S.documentList()
                    .title('Breaking now')
                    .filter(
                      '_type == "newsItem" && !(_id in path("drafts.**")) && breaking == true && dateTime(breakingUntil) > dateTime(now())',
                    )
                    .defaultOrdering([{field: 'publishedAt', direction: 'desc'}]),
                ),
            ]),
        ),
      S.divider(),
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
            .title('Missing byline, section, region, summary or photo description')
            .filter(NEEDS_ATTENTION_FILTER)
            .defaultOrdering([{field: 'publishedAt', direction: 'desc'}]),
        ),
      S.divider(),
      S.listItem()
        .title('People')
        .icon(UsersIcon)
        .child(
          S.list()
            .title('People')
            .items([
              S.listItem()
                .title('All authors')
                .icon(UserIcon)
                .child(S.documentTypeList('author').title('All authors')),
              S.listItem()
                .title('Writers with portal access')
                .icon(UsersIcon)
                .child(
                  S.documentList()
                    .title('Writers with portal access')
                    .schemaType('author')
                    .filter('_type == "author" && portalAccess == true'),
                ),
              S.divider(),
              // "writer" is the old separate login record, replaced by portal access on authors.
              // Kept visible until scripts/migrate-writers-to-authors.mjs has moved them.
              S.listItem()
                .title('Old writer records (to migrate)')
                .icon(ArchiveIcon)
                .child(S.documentTypeList('writer').title('Old writer records (read-only)')),
            ]),
        ),
      ...S.documentTypeListItems().filter((item) => !['author', 'writer'].includes(item.getId() ?? '')),
    ])
