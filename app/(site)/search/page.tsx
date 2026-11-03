import { StoryGrid } from "@/components/site/stories"
import { CATEGORY_LABELS } from "@/lib/site/config"
import { pageMetadata } from "@/lib/site/metadata"
import { getStories } from "@/lib/site/news"
import { Icon } from "@/components/site/icons"

export const revalidate = 60

export const metadata = pageMetadata({
  title: "Search TNN",
  description: "Search headlines, article text, topics and summaries.",
  path: "/search",
})

// Filtering happens in the browser (/assets/site.js) against /stories.json; every story is listed for no-JS visitors
const CATEGORY_OPTIONS = [
  CATEGORY_LABELS["politics-governance"],
  CATEGORY_LABELS["business-economy"],
  CATEGORY_LABELS["social-community-affairs"],
  CATEGORY_LABELS["sports-entertainment"],
  CATEGORY_LABELS["creative-cultural-industries"],
]

export default async function SearchPage() {
  const stories = await getStories()
  return (
    <>
      <div className="page-title">
        <h1>Search TNN</h1>
        <p>Search headlines, article text, topics and summaries.</p>
      </div>
      <form className="search-form" action="/search" method="GET" role="search">
        <label className="hp" htmlFor="search-query">
          Search TNN
        </label>
        <input
          className="search-input"
          type="search"
          id="search-query"
          name="q"
          placeholder="Try agriculture, elections or Harare"
          aria-label="Search TNN"
        />
        <button className="button" type="submit">
          <Icon name="search" />
          Search
        </button>
      </form>
      <div className="search-tools">
        <label htmlFor="category-filter">Category</label>
        <select id="category-filter" defaultValue="">
          <option value="">All categories</option>
          {CATEGORY_OPTIONS.map((label) => (
            <option key={label}>{label}</option>
          ))}
        </select>
        <label htmlFor="period-filter">Show</label>
        <select id="period-filter" defaultValue="">
          <option value="">All reporting</option>
          <option value="latest">Latest news</option>
          <option value="archive">Archive</option>
        </select>
      </div>
      <p id="search-status" role="status">
        {stories.length} {stories.length === 1 ? "story" : "stories"} available. Enter a topic to narrow the results.
      </p>
      <StoryGrid stories={stories} id="search-results" />
      <noscript>
        <p>
          Interactive search requires JavaScript. All stories are listed above; you can also browse{" "}
          <a href="/latest">latest news</a> and the <a href="/archive">archive</a>.
        </p>
      </noscript>
    </>
  )
}
