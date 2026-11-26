// Answers for "Ask the Studio" (sanity/components/HelpAssistant.tsx). Plain keyword matching,
// no AI and no outside service. To add an answer, add a topic; "go" links use the fixed ids
// in sanity/deskStructure.ts (/studio/structure/<id>).

export type Topic = {
  title: string
  words: string[]
  steps: string[]
  go?: {label: string; href: string}
}

const S = '/studio/structure'
const NEW_STORY = '/studio/intent/create/template=newsItem;type=newsItem'

export const TOPICS: Topic[] = [
  {
    title: 'Review stories writers have sent',
    words: ['review', 'approve', 'approval', 'submitted', 'submission', 'waiting', 'pending', 'check', 'writers', 'sent', 'queue', 'inbox'],
    steps: ['Open “Awaiting approval”.', 'Read the story, fix anything small, then click Publish at the bottom.'],
    go: {label: 'Open Awaiting approval', href: `${S}/awaiting`},
  },
  {
    title: 'Send a story back to the writer with changes',
    words: ['send', 'back', 'changes', 'change', 'reject', 'return', 'feedback', 'note', 'comment', 'request', 'fix', 'edit', 'writer'],
    steps: [
      'Open the story in “Awaiting approval”.',
      'Scroll to “Editor review” at the bottom. Choose “Changes requested” and write what to change.',
      'Don’t publish. The writer gets your note by email within a few minutes and sees it in the writer portal.',
    ],
    go: {label: 'Open Awaiting approval', href: `${S}/awaiting`},
  },
  {
    title: 'See stories you sent back',
    words: ['sent', 'back', 'returned', 'waiting', 'writer', 'changes', 'requested'],
    steps: ['“Sent back to writers” lists them. They return to Awaiting approval when the writer resubmits.'],
    go: {label: 'Open Sent back to writers', href: `${S}/sentBack`},
  },
  {
    title: 'Write and publish a story',
    words: ['new', 'write', 'create', 'add', 'publish', 'post', 'article', 'story', 'news'],
    steps: [
      'Fill in the title, author, main image (with description and caption), summary, sections, region and content.',
      'Click Publish. It appears on the website within a minute or two.',
    ],
    go: {label: 'Start a new story', href: NEW_STORY},
  },
  {
    title: 'Schedule a story for later',
    words: ['schedule', 'scheduled', 'later', 'tomorrow', 'time', 'date', 'future', 'timer', 'delay', 'when', 'morning'],
    steps: [
      'In the story, set “Published at” to the future date and time (Harare time).',
      'Click Publish. It stays off the website until then.',
      'To change the time, edit “Published at” and click Publish again.',
    ],
    go: {label: 'Open Scheduled', href: `${S}/scheduled`},
  },
  {
    title: 'Make a story the lead or a top story on the homepage',
    words: ['lead', 'top', 'homepage', 'home', 'front', 'feature', 'featured', 'main', 'big', 'pin', 'headline', 'position', 'move', 'first'],
    steps: [
      'Open the story. Under “Homepage placement”, choose Lead story (the big one at the top) or Top story (beside it).',
      'Optional: set “Featured until” for when it should drop back to Latest news.',
      'Click Publish. Never change “Published at” to move a story up.',
    ],
    go: {label: 'See what is on the homepage', href: `${S}/homepage;lead`},
  },
  {
    title: 'Mark a story as breaking news',
    words: ['breaking', 'urgent', 'alert', 'red', 'label', 'band', 'now'],
    steps: ['Open the story, switch on “Breaking news” and choose “Breaking until”.', 'Click Publish. The label comes off by itself at that time.'],
    go: {label: 'Open Breaking now', href: `${S}/homepage;breaking`},
  },
  {
    title: 'Add or change a photo and its caption',
    words: ['photo', 'picture', 'image', 'pic', 'caption', 'credit', 'featured', 'cover', 'thumbnail', 'description', 'alt', 'small', 'size'],
    steps: [
      'Open the story and use “Main image”. Drag in a photo at least 1200px wide.',
      'Fill in “Photo description” (what is in the photo) and “Caption and credit”, e.g. “Photo: supplied”.',
      'Click Publish. “Photos to improve” lists stories with small or missing photos.',
    ],
    go: {label: 'Open Photos to improve', href: `${S}/photos`},
  },
  {
    title: 'Take a story off the website',
    words: ['unpublish', 'remove', 'delete', 'take', 'down', 'hide', 'off', 'withdraw', 'pull'],
    steps: [
      'Open the story, then the menu next to Publish, and choose Unpublish. It goes back to being a draft.',
      'Only use Delete if it should be gone for good.',
    ],
    go: {label: 'Open All stories', href: `${S}/stories`},
  },
  {
    title: 'Undo a change or get an old version back',
    words: ['undo', 'restore', 'history', 'mistake', 'wrong', 'old', 'version', 'previous', 'revert', 'back', 'lost'],
    steps: ['Open the story and click the clock icon at the top right.', 'Pick an earlier version and click Restore, then Publish.'],
  },
  {
    title: 'Correct or update a published story',
    words: ['correct', 'correction', 'update', 'updated', 'published', 'live', 'typo', 'error', 'mistake', 'fix', 'new', 'information', 'edit'],
    steps: [
      'Edit the story and click Publish again.',
      'For important new information, also set “Last substantial update”. Readers then see “Updated …”. Leave it for typo fixes.',
    ],
    go: {label: 'Open All stories', href: `${S}/stories`},
  },
  {
    title: 'Move an old story to the Archive',
    words: ['archive', 'old', 'outdated', 'older'],
    steps: ['Open the story, switch on “Archive story” and click Publish. It moves from Latest news to the Archive.'],
  },
  {
    title: 'Give a writer access to the writer portal',
    words: ['writer', 'access', 'invite', 'portal', 'login', 'sign', 'account', 'password', 'join', 'reporter', 'contributor', 'code'],
    steps: [
      'Under People, open their author profile (or add one) and switch on “Can sign in to the writer portal”.',
      'Click the button to make an invite code. Send them the code and this link: thenarrativenetwork.org/write/join',
      'To remove access, switch it off. Their published stories stay up.',
    ],
    go: {label: 'Open Writers with portal access', href: `${S}/people;writers`},
  },
  {
    title: 'Edit a reporter’s profile (photo, bio, role)',
    words: ['author', 'profile', 'bio', 'byline', 'reporter', 'role', 'headshot', 'social', 'name', 'spelling'],
    steps: ['Open People → All authors and choose the person. Add a photo, role and a short bio, then Publish.'],
    go: {label: 'Open Profiles to complete', href: `${S}/people;profiles`},
  },
  {
    title: 'Fix stories with missing details',
    words: ['missing', 'attention', 'warning', 'required', 'incomplete', 'problem', 'errors', 'red'],
    steps: ['“Needs attention” lists published stories missing a byline, section, region, summary or photo description. Fill them in and Publish.'],
    go: {label: 'Open Needs attention', href: `${S}/attention`},
  },
  {
    title: 'Add a video episode to Watch TNN',
    words: ['video', 'youtube', 'episode', 'watch', 'programme', 'program', 'show', 'interview', 'clip'],
    steps: ['Open Watch TNN → Episodes and click “+”. Paste the YouTube link, choose the programme, add a short summary and when it was first shown, then Publish.'],
    go: {label: 'Open Watch TNN', href: `${S}/watch;episodes`},
  },
  {
    title: 'Tag a story (people, places, topics)',
    words: ['tag', 'tags', 'topic', 'keyword', 'related', 'person', 'place'],
    steps: ['In the story’s Tags field, start typing to find a tag or create a new one. Stories with the same tags are shown together as related reading.'],
    go: {label: 'Open Tags', href: `${S}/tags`},
  },
  {
    title: 'Choose the section or region',
    words: ['section', 'sections', 'category', 'categories', 'politics', 'business', 'sport', 'region', 'zimbabwe', 'africa', 'world'],
    steps: ['In the story, pick one or more Sections (the first is the main one) and a Region. They decide which pages it appears on.'],
  },
  {
    title: 'Change how a story looks in Google',
    words: ['google', 'search', 'seo', 'bing', 'ranking', 'results'],
    steps: ['In the story, open “Search engines” and fill in the search headline and description. Leave them empty to use the title and summary.'],
  },
]

export const normalise = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1)

// Words in almost every question: they count for little, so "delete a story" finds deleting
const COMMON = new Set(['story', 'stories', 'news', 'article', 'post', 'add', 'new', 'change', 'edit', 'make', 'how', 'the', 'and', 'to', 'on', 'it', 'my', 'do', 'can', 'is', 'for', 'with', 'page', 'writer', 'writers', 'back', 'now', 'fix'])

// Words count if they match a keyword or share its start ("schedul" matches "scheduling")
function score(topic: Topic, query: string[]) {
  const title = normalise(topic.title)
  let points = 0
  for (const q of query) {
    if (COMMON.has(q)) {
      if (topic.words.includes(q)) points += 1
      continue
    }
    if (topic.words.some((w) => w === q)) points += 3
    else if (q.length >= 4 && topic.words.some((w) => w.startsWith(q.slice(0, 5)) || q.startsWith(w.slice(0, 5)))) points += 2
    if (title.includes(q)) points += 1
  }
  return points
}

// The best few topics for a question, or null when the question is empty
export function findTopics(question: string, limit = 3): Topic[] | null {
  const query = normalise(question)
  if (query.length === 0) return null
  return TOPICS.map((topic) => ({topic, points: score(topic, query)}))
    .filter((r) => r.points >= 2)
    .sort((a, b) => b.points - a.points)
    .slice(0, limit)
    .map((r) => r.topic)
}
