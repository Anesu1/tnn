import type {StructureResolver} from 'sanity/structure'
import {BoltIcon, CalendarIcon, ClockIcon, DocumentsIcon, HomeIcon, ImageIcon, PlayIcon, StarIcon, TagIcon, TagsIcon, UndoIcon, UserIcon, UsersIcon, WarningOutlineIcon} from '@sanity/icons'

// Published stories missing what newsItemType now requires before publishing
const NEEDS_ATTENTION_FILTER = `_type == "newsItem" && !(_id in path("drafts.**")) && (
  !defined(author) ||
  count(coalesce(categories, [])) == 0 ||
  !defined(region) ||
  !defined(excerpt) || excerpt == "" ||
  (defined(mainImage.asset) && (!defined(mainImage.alt) || mainImage.alt == ""))
)`

// Published stories with no photo, or one narrower than Google's 1200px for large previews
const PHOTOS_FILTER = `_type == "newsItem" && !(_id in path("drafts.**")) && (!defined(mainImage.asset) || mainImage.asset->metadata.dimensions.width < 1200)`

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
      // Published with a future time: hidden from the website until then
      S.listItem()
        .title('Scheduled')
        .icon(CalendarIcon)
        .child(
          S.documentList()
            .title('Scheduled to go live')
            .filter('_type == "newsItem" && !(_id in path("drafts.**")) && dateTime(publishedAt) > dateTime(now())')
            .defaultOrdering([{field: 'publishedAt', direction: 'asc'}]),
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
      S.listItem()
        .title('Photos to improve')
        .icon(ImageIcon)
        .child(
          S.documentList()
            .title('No photo, or narrower than 1200px')
            .filter(PHOTOS_FILTER)
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
              S.listItem()
                .title('Profiles to complete')
                .icon(WarningOutlineIcon)
                .child(
                  S.documentList()
                    .title('No bio, photo or role')
                    .schemaType('author')
                    .filter('_type == "author" && (!defined(bio) || !defined(photo.asset) || !defined(role) || role == "")'),
                ),
            ]),
        ),
      // Video programmes and their episodes (pages under /watch)
      S.listItem()
        .title('Watch TNN')
        .icon(PlayIcon)
        .child(
          S.list()
            .title('Watch TNN')
            .items([
              S.documentTypeListItem('episode').title('Episodes'),
              S.documentTypeListItem('programme').title('Programmes'),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title('All stories')
        .icon(DocumentsIcon)
        .child(S.documentTypeList('newsItem').title('All stories').defaultOrdering([{field: 'publishedAt', direction: 'desc'}])),
      S.documentTypeListItem('category').title('Sections').icon(TagIcon),
      S.documentTypeListItem('tag').title('Tags').icon(TagsIcon),
    ])
