import {useDocumentOperation, type DocumentActionComponent} from 'sanity'

// Wraps the normal Publish button: the first time a story is published, "Published at"
// is set to that moment, unless the editor has already filled it in by hand.
export function withPublishedAt(originalPublishAction: DocumentActionComponent): DocumentActionComponent {
  const PublishWithDate: DocumentActionComponent = (props) => {
    const originalResult = originalPublishAction(props)
    const {patch} = useDocumentOperation(props.id, props.type)

    if (!originalResult) return originalResult

    return {
      ...originalResult,
      onHandle: () => {
        const neverPublished = !props.published
        if (neverPublished && !props.draft?.publishedAt) {
          patch.execute([{set: {publishedAt: new Date().toISOString()}}])
        }
        originalResult.onHandle?.()
      },
    }
  }
  PublishWithDate.action = originalPublishAction.action
  return PublishWithDate
}
