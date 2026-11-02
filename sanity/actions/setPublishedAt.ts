import {useDocumentOperation, type DocumentActionComponent} from 'sanity'

// Wraps the normal Publish button for news stories:
// - the first time a story is published, "Published at" is set to that moment,
//   unless the editor has already filled it in by hand
// - the private review status and note to the writer are cleared, because
//   published documents are publicly readable
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
