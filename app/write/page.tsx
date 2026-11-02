import Link from "next/link"

import { requireWriter } from "@/lib/writer-auth"
import { getWriteClient } from "@/sanity/lib/writeClient"
import { withdrawStoryAction } from "./actions"

type StoryDoc = {
  _id: string
  title?: string
  slug?: string
  image?: string
  reviewStatus?: string
  editorNote?: string
  _updatedAt: string
}

type Story = StoryDoc & { baseId: string; published: boolean; pending: boolean; sentBack: boolean }

// The raw perspective returns both the draft and published copy of a story; merge them per story
function groupStories(docs: StoryDoc[]): Story[] {
  const byId = new Map<string, Story>()
  for (const doc of docs) {
    const isDraft = doc._id.startsWith("drafts.")
    const baseId = doc._id.replace(/^drafts\./, "")
    const existing = byId.get(baseId)
    const story = existing ?? { ...doc, baseId, published: false, pending: false, sentBack: false }
    // Show the most recently edited copy's title and photo
    if (existing && doc._updatedAt > existing._updatedAt) Object.assign(story, doc)
    if (isDraft) {
      story.pending = true
      // Review status and the editor's note only ever live on the draft
      story.sentBack = doc.reviewStatus === "changesRequested"
      story.editorNote = doc.editorNote
    } else {
      story.published = true
    }
    byId.set(baseId, story)
  }
  return [...byId.values()].sort((a, b) => b._updatedAt.localeCompare(a._updatedAt))
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" })

export default async function WriterDashboard({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>
}) {
  const writer = await requireWriter()
  const { saved } = await searchParams

  const docs = await getWriteClient().fetch<StoryDoc[]>(
    `*[_type == "newsItem" && submittedBy._ref == $writerId]{
      _id, title, "slug": slug.current, "image": mainImage.asset->url, reviewStatus, editorNote, _updatedAt
    }`,
    { writerId: writer._id },
  )
  const stories = groupStories(docs)
  const sentBack = stories.filter((s) => !s.published && s.sentBack)
  const awaiting = stories.filter((s) => !s.published && !s.sentBack)
  const published = stories.filter((s) => s.published)

  return (
    <>
      <div className="page-head">
        <div>
          <span className="label">My contributions</span>
          <h1 style={{ marginTop: 8 }}>Welcome, {writer.name.split(" ")[0]}</h1>
          <p className="intro">
            {stories.length === 0
              ? "Write and submit stories here. The chief editor reviews each one before it goes live."
              : `You have contributed ${stories.length} ${stories.length === 1 ? "story" : "stories"}: ${published.length} published, ${awaiting.length} awaiting approval${sentBack.length ? `, ${sentBack.length} sent back to you` : ""}.`}
          </p>
        </div>
        <Link href="/write/new" className="button">
          + Write a story
        </Link>
      </div>

      {saved && (
        <div className="notice success" role="status">
          Your story was saved and sent to the chief editor for approval.
        </div>
      )}

      {sentBack.length > 0 && (
        <>
          <div className="section-head">
            <h2>Sent back to you</h2>
            <span className="meta">{sentBack.length}</span>
          </div>
          {sentBack.map((story) => (
            <div className="story" key={story.baseId}>
              <div className="thumb">{story.image && <img src={`${story.image}?w=200&h=125&fit=crop`} alt="" />}</div>
              <div>
                <span className="label">Needs changes</span>
                <span className="status changes">Changes requested</span>
                <h3>{story.title || "Untitled story"}</h3>
                {story.editorNote && (
                  <p className="editor-note">
                    <strong>Note from the editor:</strong> {story.editorNote}
                  </p>
                )}
              </div>
              <div className="story-actions">
                <Link href={`/write/${story.baseId}`} className="button">
                  Make changes
                </Link>
              </div>
            </div>
          ))}
        </>
      )}

      <div className="section-head">
        <h2>Awaiting approval</h2>
        <span className="meta">{awaiting.length}</span>
      </div>
      {awaiting.length === 0 ? (
        <div className="empty">Nothing waiting. Stories you submit appear here until the chief editor publishes them.</div>
      ) : (
        awaiting.map((story) => (
          <div className="story" key={story.baseId}>
            <div className="thumb">{story.image && <img src={`${story.image}?w=200&h=125&fit=crop`} alt="" />}</div>
            <div>
              <span className="label">Submitted</span>
              <span className="status pending">Awaiting approval</span>
              <h3>{story.title || "Untitled story"}</h3>
              <span className="meta">Last edited {dateFormat.format(new Date(story._updatedAt))}</span>
            </div>
            <div className="story-actions">
              <Link href={`/write/${story.baseId}`}>Edit</Link>
              <form action={withdrawStoryAction}>
                <input type="hidden" name="id" value={story.baseId} />
                <button className="link-button danger">Withdraw</button>
              </form>
            </div>
          </div>
        ))
      )}

      <div className="section-head">
        <h2>Published</h2>
        <span className="meta">{published.length}</span>
      </div>
      {published.length === 0 ? (
        <div className="empty">None of your stories have been published yet.</div>
      ) : (
        published.map((story) => (
          <div className="story" key={story.baseId}>
            <div className="thumb">{story.image && <img src={`${story.image}?w=200&h=125&fit=crop`} alt="" />}</div>
            <div>
              <span className="label">Live</span>
              <span className="status live">Published</span>
              <h3>{story.title || "Untitled story"}</h3>
              <span className="meta">
                {story.pending ? "The editor is making changes" : `Updated ${dateFormat.format(new Date(story._updatedAt))}`}
              </span>
            </div>
            <div className="story-actions">
              {story.slug && (
                <Link href={`/article/${story.slug}`} target="_blank">
                  View on site
                </Link>
              )}
            </div>
          </div>
        ))
      )}
    </>
  )
}
