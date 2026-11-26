# Search engines: setup and checklist

What the site does on its own, and the few things to set up once.

## Already built in

- **Sitemaps**: `/sitemap.xml` (every live story, section, region and author page, with last-modified
  dates) and `/news-sitemap.xml` (the last 2 days, for Google News). Both are listed in `/robots.txt`.
- **Structured data**: NewsArticle (or Analysis/Opinion/etc. by story type) with publish and update
  times, BreadcrumbList on every story, Person on author pages, NewsMediaOrganization and WebSite on
  the homepage.
- **Titles and descriptions**: every page has its own. Stories use the headline and summary, or the
  optional *Search headline* and *Search description* in the Studio (under "Search engines").
- **Images**: readable file names (the story's slug) and alt text from *Photo description*.
- **Moved and removed pages**: old addresses redirect with 301; removed stories return 404.
- **Scheduled stories** stay out of every page, feed and sitemap until their publish time.
- **IndexNow**: tells Bing straight away when a story is published, updated or unpublished (below).

## Set up once

### 1. Netlify environment variables (scope: Functions)

| Name | Value |
|---|---|
| `INDEXNOW_KEY` | From `.env.local`. Public by design: the site serves it at `/indexnow-key.txt`. |
| `SANITY_WEBHOOK_SECRET` | From `.env.local`. Also pasted into the Sanity webhook below. |

`DESK_CRON_SECRET` (already set) authorises the hourly IndexNow run in `netlify/functions/indexnow.mts`.

### 2. Sanity webhook (sanity.io/manage → project → API → Webhooks → Create)

| Setting | Value |
|---|---|
| Name | IndexNow |
| URL | `https://thenarrativenetwork.org/api/indexnow` |
| Dataset | production |
| Trigger on | Create, Update, Delete |
| Filter | `_type == "newsItem"` |
| Projection | `{"slug": coalesce(after().slug.current, before().slug.current), "publishedAt": coalesce(after().publishedAt, before().publishedAt), "region": coalesce(after().region, before().region), "operation": delta::operation()}` |
| Status | Enable webhook |
| HTTP method | POST |
| API version | v2021-03-25 or later |
| Drafts | Off (only published changes) |
| Secret | the `SANITY_WEBHOOK_SECRET` value |

### 3. Bing Webmaster Tools (bing.com/webmasters)

1. Sign in and choose **Import from Google Search Console**. It verifies the site and copies the
   sitemaps in one step. (Or add the site and verify with the DNS record it gives you.)
2. Under **Sitemaps**, check both `/sitemap.xml` and `/news-sitemap.xml` are listed.
3. Under **IndexNow**, submissions start showing after the next story is published.

### 4. Google Search Console

Under **Sitemaps**, submit `https://thenarrativenetwork.org/news-sitemap.xml` (the main sitemap is
probably already there).

## For editors: what helps a story rank

- **Put the full name people search for in the headline or the Search headline**: "Prophet Uebert
  Angel arrested…", not "Prophet Angel arrested". Searchers type the names they know.
- **Say who, what, where in the first sentence** of the summary and the story. Bing and Google both
  favour pages that answer early.
- **Write a real photo description** (what is in the picture), and choose the right section and region.
- **Don't change the web address (slug) of a published story**, and don't backdate to move a story up
  the homepage: use Homepage placement.
- **Set "Last substantial update"** when a story gains important new facts, not for typo fixes.
- **Fill in author profiles** (photo, role, bio, links) under People: named, credible authors help trust.
- **Link related TNN stories** inside the text where they genuinely add context.
