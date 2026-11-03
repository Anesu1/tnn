// Site-wide settings for the public TNN site. Names, links and copy follow the
// reference design at storied-travesseiro-613f08.netlify.app.

export const SITE_URL = "https://thenarrativenetwork.org"
export const SITE_NAME = "The Narrative Network"
export const SITE_DESCRIPTION = "News, perspectives and conversations from Zimbabwe, Africa and the world."
export const WHATSAPP_URL = "https://whatsapp.com/channel/0029VbCHiM5EquiT4lGKOy2L"
export const YOUTUBE_URL = "https://www.youtube.com/@TheNarrativeNetwork-t9c"
export const TIME_ZONE = "Africa/Harare"

// Public section pages (/category/<slug>) and the Sanity category keys each one covers
export const SECTIONS = [
  { slug: "politics", title: "Politics & Governance", keys: ["politics-governance"] },
  { slug: "business", title: "Business & Economy", keys: ["business-economy"] },
  { slug: "community", title: "Social & Community", keys: ["social-community-affairs"] },
  { slug: "sport-culture", title: "Sports & Entertainment", keys: ["sports-entertainment", "creative-cultural-industries"] },
] as const

export type SectionSlug = (typeof SECTIONS)[number]["slug"]

// Label shown on cards for each Sanity category key
export const CATEGORY_LABELS: Record<string, string> = {
  "politics-governance": "Politics & Governance",
  "business-economy": "Business & Economy",
  "social-community-affairs": "Social & Community",
  "sports-entertainment": "Sports & Entertainment",
  "creative-cultural-industries": "Creative & Cultural Industries",
  "breaking-news": "Breaking News",
}

export function sectionForCategoryKey(key?: string) {
  return SECTIONS.find((section) => key && (section.keys as readonly string[]).includes(key))
}

export const REGIONS = [
  { slug: "zimbabwe", title: "Zimbabwe", intro: "Reporting and perspectives from Zimbabwe." },
  { slug: "africa", title: "Africa", intro: "Reporting and perspectives from Africa." },
  { slug: "world", title: "World", intro: "International stories and their connections to Africa." },
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
