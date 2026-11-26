import {useDocumentOperation, type DocumentActionComponent} from 'sanity'

// Wraps the normal Publish button for news stories:
// - the first time a story is published, "Published at" is set to that moment,
//   unless the editor has already filled it in by hand
// - if the story has no web address yet, one is made from the headline, so editors never
//   have to find the "Generate" button
// - the private review status and note to the writer are cleared, because
//   published documents are publicly readable
// Same shape as the Studio's Generate button: lower case, words joined by hyphens
const slugify = (title: string) =>
  title
    .toLowerCase()
    .normalize('NFKD') // é becomes e + accent mark…
    .replace(/\p{Mn}/gu, '') // …and the accent mark is dropped
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
    .replace(/-+$/, '')

export function withPublishedAt(originalPublishAction: DocumentActionComponent): DocumentActionComponent {
  const PublishWithDate: DocumentActionComponent = (props) => {
    const originalResult = originalPublishAction(props)
    const {patch} = useDocumentOperation(props.id, props.type)

    if (!originalResult) return originalResult

    return {
      ...originalResult,
      onHandle: () => {
        const neverPublished = !props.published
        const patches: Record<string, unknown>[] = []
        if (neverPublished && !props.draft?.publishedAt) {
          patches.push({set: {publishedAt: new Date().toISOString()}})
        }
        const draft = props.draft as {slug?: {current?: string}; title?: string} | null
        if (!draft?.slug?.current && draft?.title) {
          patches.push({set: {slug: {_type: 'slug', current: slugify(draft.title)}}})
        }
        if (props.draft?.reviewStatus || props.draft?.editorNote) {
          patches.push({unset: ['reviewStatus', 'editorNote']})
        }
        if (patches.length) patch.execute(patches)
        originalResult.onHandle?.()
      },
    }
  }
  PublishWithDate.action = originalPublishAction.action
  return PublishWithDate
}
