import type { StoryType } from "./config"

// Pages that list stories by the Story type editors set in the Studio (linked in the second
// menu row). Each lists only that type, newest first.
export const STORY_TYPE_PAGES = {
  investigations: {
    type: "investigation",
    title: "Investigations",
    label: "Investigations",
    intro: "In-depth, evidence-based reporting from The Narrative Network on accountability, governance and public interest.",
    description:
      "TNN investigations: in-depth, evidence-based reporting on accountability, governance and public-interest issues in Zimbabwe and across Africa.",
  },
  interviews: {
    type: "interview",
    title: "Interviews",
    label: "Interviews",
    intro: "Conversations with the people shaping Zimbabwe and Africa, in their own words.",
    description: "TNN interviews: conversations with the people shaping Zimbabwe and Africa, in their own words.",
  },
  opinion: {
    type: "opinion",
    title: "Opinion",
    label: "Opinion",
    intro: "Commentary and analysis, clearly labelled. The views are the writers’ own.",
    description: "Opinion and commentary from The Narrative Network, clearly labelled and separate from news reporting. Views are the writers’ own.",
  },
} satisfies Record<string, { type: StoryType; title: string; label: string; intro: string; description: string }>

export type StoryTypePage = keyof typeof STORY_TYPE_PAGES
