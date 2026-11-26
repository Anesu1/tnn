// Site-wide settings for the public TNN site. Names, links and copy follow the
// reference design at storied-travesseiro-613f08.netlify.app.

export const SITE_URL = "https://thenarrativenetwork.org"
export const SITE_NAME = "The Narrative Network"
export const SITE_DESCRIPTION = "News, perspectives and conversations from Zimbabwe, Africa and the world."
// Longer description for search results on the homepage (Bing flags overly short descriptions)
export const SITE_SEARCH_DESCRIPTION =
  "Independent news and analysis from Zimbabwe, Africa and the world: politics, business, health, education, communities, sport and culture."
export const WHATSAPP_URL = "https://whatsapp.com/channel/0029VbCHiM5EquiT4lGKOy2L"
export const YOUTUBE_URL = "https://www.youtube.com/@TheNarrativeNetwork-t9c"
export const TIME_ZONE = "Africa/Harare"
// Google Tag Manager container, loaded on the public site only (not the Desk, portal or Studio)
export const GTM_ID = "GTM-K8DR5L5R"

// Public section pages (/category/<slug>) and the Sanity category keys each one covers.
// The six sections match the fixed list in sanity/schemaTypes/categoryType.ts.
// `nav` is the menu label; `short` is used on phones, where the menu is a tight grid.
export const SECTIONS = [
  { slug: "politics", title: "Politics & Governance", nav: "POLITICS", short: "POLITICS", keys: ["politics-governance"], about: "Government, elections, Parliament, public policy, political parties and constitutional affairs in Zimbabwe and across Africa." },
  { slug: "business", title: "Business & Economy", nav: "BUSINESS", short: "BUSINESS", keys: ["business-economy"], about: "Companies, finance, markets, mining, agriculture, jobs and the cost of living in Zimbabwe and across Africa." },
  { slug: "health-education", title: "Health & Education", nav: "HEALTH & EDUCATION", short: "HEALTH", keys: ["health-education"], about: "Healthcare, public health, hospitals, schools, universities, exams and education policy in Zimbabwe and across Africa." },
  { slug: "community", title: "Community & Society", nav: "COMMUNITY", short: "COMMUNITY", keys: ["community-society"], about: "Local communities, crime and courts, social issues, infrastructure and public services across Zimbabwe." },
  { slug: "sport-culture", title: "Sports & Culture", nav: "SPORT & CULTURE", short: "SPORT", keys: ["sports-culture"], about: "Football and other sport, arts, music, heritage, festivals and culture in Zimbabwe and across Africa." },
  { slug: "entertainment", title: "Entertainment & Lifestyle", nav: "ENTERTAINMENT", short: "LIFESTYLE", keys: ["entertainment-lifestyle"], about: "Entertainment, celebrity news, film, television, fashion, food, travel and lifestyle from Zimbabwe and beyond." },
] as const

export type SectionSlug = (typeof SECTIONS)[number]["slug"]

// Label shown on cards for each Sanity category key
export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  SECTIONS.flatMap((section) => section.keys.map((key) => [key, section.title])),
)

// Story types, as listed in the Studio and the writer portal. "news" has no label.
export const STORY_TYPES = {
  news: { label: "News", schema: "NewsArticle" },
  live: { label: "Live updates", schema: "LiveBlogPosting" },
  analysis: { label: "Analysis", schema: "AnalysisNewsArticle" },
  opinion: { label: "Opinion", schema: "OpinionNewsArticle" },
  investigation: { label: "Investigation", schema: "ReportageNewsArticle" },
  interview: { label: "Interview", schema: "NewsArticle" },
  explainer: { label: "Explainer", schema: "BackgroundNewsArticle" },
  feature: { label: "Feature", schema: "NewsArticle" },
} as const

export type StoryType = keyof typeof STORY_TYPES

export function sectionForCategoryKey(key?: string) {
  return SECTIONS.find((section) => key && (section.keys as readonly string[]).includes(key))
}

export const REGIONS = [
  {
    slug: "zimbabwe",
    title: "Zimbabwe",
    intro: "Reporting and perspectives from Zimbabwe.",
    about: "Latest news from across Zimbabwe: politics, the economy, courts, communities, health, education and culture, from The Narrative Network.",
  },
  {
    slug: "africa",
    title: "Africa",
    intro: "Reporting and perspectives from Africa.",
    about: "News and analysis from across Africa, including South Africa, SADC and the wider continent, with the context that matters to Zimbabwean and African readers.",
  },
  {
    slug: "world",
    title: "World",
    intro: "International stories and their connections to Africa.",
    about: "International news and its connections to Zimbabwe and Africa: diplomacy, trade, migration, climate and global events, explained by The Narrative Network.",
  },
] as const

export type RegionSlug = (typeof REGIONS)[number]["slug"]

// Programmes on the TNN YouTube channel, as listed on the reference Watch page
export const VIDEOS = [
  {
    url: "https://www.youtube.com/watch?v=B-YvSZEJRos",
    programme: "Girls’ Chat ZW",
    title: "Money, men & financial freedom: what every young woman must know",
    summary: "A Girls’ Chat ZW conversation on money and financial independence.",
  },
  {
    url: "https://www.youtube.com/watch?v=N-VAKIWujKA&t=8s&pp=0gcJCTkMAYcqIYzv",
    programme: "Nation Watch",
    title: "Douglas Mwonzora on CAB 4: what they aren’t telling Zimbabweans",
    summary: "A Nation Watch interview on Zimbabwe’s constitutional debate.",
  },
  {
    url: "https://www.youtube.com/watch?v=frIiB18eVII&t=541s",
    programme: "TNN interviews",
    title: "Can love survive polygamy? Sue Nyathi on love, marriage and betrayal",
    summary: "A conversation with author Sue Nyathi about relationships.",
  },
  {
    url: "https://www.youtube.com/watch?v=6DHXvoAgiQk&pp=0gcJCTkMAYcqIYzv",
    programme: "ASI Business Roundtable",
    title: "What if earning more money is not the solution to being financially stable?",
    summary: "An ASI Business Roundtable discussion about personal finance.",
  },
]

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: TIME_ZONE })

export function formatDate(iso?: string) {
  return iso ? dateFormat.format(new Date(iso)) : ""
}

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: TIME_ZONE,
})

// "5 November 2026, 14:00 CAT" (Harare time)
export function formatDateTime(iso?: string) {
  return iso ? `${dateTimeFormat.format(new Date(iso)).replace(" at ", ", ")} CAT` : ""
}
