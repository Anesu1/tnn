import type {StructureResolver} from 'sanity/structure'
import {
  BoltIcon,
  CalendarIcon,
  ClockIcon,
  DocumentsIcon,
  HelpCircleIcon,
  HomeIcon,
  ImageIcon,
  PlayIcon,
  StarIcon,
  TagIcon,
  TagsIcon,
  UndoIcon,
  UserIcon,
  UsersIcon,
  WarningOutlineIcon,
} from '@sanity/icons'

import {StartHere} from './components/StartHere'

// The sidebar follows the day: guide, stories to review, what's scheduled and on the homepage,
// things to fix, then people, video and everything else. Names are plain words, not field names.

const PUBLISHED = `_type == "newsItem" && !(_id in path("drafts.**"))`

// Published stories missing what the story form now requires before publishing
const NEEDS_FIXING_FILTER = `${PUBLISHED} && (
  !defined(author) ||
  count(coalesce(categories, [])) == 0 ||
  !defined(region) ||
  !defined(excerpt) || excerpt == "" ||
  (defined(mainImage.asset) && (!defined(mainImage.alt) || mainImage.alt == ""))
)`

// Published stories with no photo, or one narrower than Google's 1200px for large previews
const PHOTOS_FILTER = `${PUBLISHED} && (!defined(mainImage.asset) || mainImage.asset->metadata.dimensions.width < 1200)`

const NEWEST = [{field: 'publishedAt', direction: 'desc' as const}]

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('TNN Studio')
    .items([
      S.listItem().title('Start here').icon(HelpCircleIcon).child(S.component(StartHere).title('Start here')),
      S.divider(),

      // Drafts reporters sent from the writer portal, and drafts started here
      S.listItem()
        .title('To review')
        .icon(ClockIcon)
        .child(
          S.documentList()
            .title('To review: not yet published')
            .filter('_type == "newsItem" && _id in path("drafts.**") && reviewStatus != "changesRequested"')
            .defaultOrdering([{field: '_updatedAt', direction: 'desc'}]),
        ),
      S.listItem()
        .title('Sent back to reporters')
        .icon(UndoIcon)
        .child(
          S.documentList()
            .title('Sent back: waiting for the reporter')
            .filter('_type == "newsItem" && _id in path("drafts.**") && reviewStatus == "changesRequested"')
            .defaultOrdering([{field: '_updatedAt', direction: 'desc'}]),
        ),
      // Published with a future time: hidden from the website until then
      S.listItem()
        .title('Scheduled')
        .icon(CalendarIcon)
        .child(
          S.documentList()
            .title('Scheduled to go live')
            .filter(`${PUBLISHED} && dateTime(publishedAt) > dateTime(now())`)
            .defaultOrdering([{field: 'publishedAt', direction: 'asc'}]),
        ),
      S.listItem()
        .title('Homepage now')
        .icon(HomeIcon)
        .child(
          S.list()
            .title('Homepage now')
            .items([
              S.listItem()
                .title('Lead and top stories')
                .icon(StarIcon)
                .child(
                  S.documentList()
                    .title('Lead and top stories')
                    .filter(
                      `${PUBLISHED} && placement in ["lead", "top"] && (!defined(featuredUntil) || dateTime(featuredUntil) > dateTime(now()))`,
                    )
                    .defaultOrdering([{field: 'placement', direction: 'asc'}, {field: 'topOrder', direction: 'asc'}]),
                ),
              S.listItem()
                .title('Breaking news')
                .icon(BoltIcon)
                .child(
                  S.documentList()
                    .title('Breaking news')
                    .filter(`${PUBLISHED} && breaking == true && dateTime(breakingUntil) > dateTime(now())`)
                    .defaultOrdering(NEWEST),
                ),
            ]),
        ),
      S.listItem()
        .title('Needs fixing')
        .icon(WarningOutlineIcon)
        .child(
          S.list()
            .title('Needs fixing')
            .items([
              S.listItem()
                .title('Missing details')
                .icon(WarningOutlineIcon)
                .child(
                  S.documentList()
                    .title('Missing reporter, section, region, summary or photo description')
                    .filter(NEEDS_FIXING_FILTER)
                    .defaultOrdering(NEWEST),
                ),
              S.listItem()
                .title('Photos to improve')
                .icon(ImageIcon)
                .child(S.documentList().title('No photo, or narrower than 1200px').filter(PHOTOS_FILTER).defaultOrdering(NEWEST)),
              S.listItem()
                .title('Reporter profiles to complete')
                .icon(UserIcon)
                .child(
                  S.documentList()
                    .title('No bio, photo or role')
                    .schemaType('author')
                    .filter('_type == "author" && (!defined(bio) || !defined(photo.asset) || !defined(role) || role == "")'),
                ),
            ]),
        ),
      S.divider(),

      S.listItem()
        .title('All stories')
        .icon(DocumentsIcon)
        .child(S.documentTypeList('newsItem').title('All stories').defaultOrdering(NEWEST)),
      S.listItem()
        .title('Reporters')
        .icon(UsersIcon)
        .child(
          S.list()
            .title('Reporters')
            .items([
              S.listItem().title('All reporters').icon(UserIcon).child(S.documentTypeList('author').title('All reporters')),
              S.listItem()
                .title('Can use the writer portal')
                .icon(UsersIcon)
                .child(
                  S.documentList()
                    .title('Can use the writer portal')
                    .schemaType('author')
                    .filter('_type == "author" && portalAccess == true'),
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
      S.documentTypeListItem('tag').title('Tags').icon(TagsIcon),
      S.documentTypeListItem('category').title('Sections (fixed)').icon(TagIcon),
    ])
