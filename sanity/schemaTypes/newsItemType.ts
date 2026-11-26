// Every date and time in the Studio is shown and entered in Harare time, whatever the editor's
// computer is set to, so a story scheduled for 06:00 goes out at 06:00 CAT.
const HARARE_TIME = { displayTimeZone: "Africa/Harare", allowTimeZoneSwitch: false, timeStep: 5 }

export default {
    name: "newsItem",
    title: "News",
    type: "document",
    fields: [
        {
            name: "title",
            title: "Headline",
            type: "string",
            validation: (Rule: any) => [
                Rule.required().error("Add a headline"),
                Rule.max(140).error("Headlines are under 140 characters. Has the story text gone in here by mistake?"),
            ],
        },
        {
            name: "slug",
            title: "Slug",
            type: "slug",
            options: {
                source: "title",
                maxLength: 96,
            },
            // Not required: Publish fills it in from the title when empty (sanity/actions/setPublishedAt.ts)
        },
        {
            name: "publishedAt",
            title: "Published at",
            type: "datetime",
            description:
                "Harare time. Leave empty to publish now. To schedule, set a future time and click Publish: the story stays off the website until then and appears within a couple of minutes of that time. Never change it to move a story up the homepage (use Homepage placement).",
            options: HARARE_TIME,
        },
        {
            name: "lastUpdated",
            title: "Last substantial update",
            type: "datetime",
            options: HARARE_TIME,
            description:
                "Set this when the story gains important new information. Readers see “Updated …” and Google sees the change. Leave it alone for typo fixes.",
            validation: (Rule: any) =>
                Rule.custom((value: string | undefined, context: any) =>
                    value && context.document?.publishedAt && value < context.document.publishedAt
                        ? "The update can't be before the story was published"
                        : true,
                ),
        },
        {
            name: "author",
            title: "Author",
            type: "reference",
            to: { type: "author" },
            validation: (Rule: any) => Rule.required().error("Add a byline before publishing"),
        },
        {
            name: "mainImage",
            title: "Main image",
            type: "image",
            options: {
                hotspot: true,
            },
            // A warning, not an error: editors can still publish. Google Discover and Top Stories
            // prefer images at least 1200px wide, and smaller ones can keep a story out of Discover.
            // The asset id carries the size, e.g. "image-<hash>-515x596-jpg".
            validation: (Rule: any) =>
                Rule.custom((image: { asset?: { _ref?: string } } | undefined) => {
                    const width = Number(image?.asset?._ref?.match(/-(\d+)x\d+-[a-z]+$/)?.[1])
                    return width && width < 1200
                        ? `This photo is ${width}px wide. Use one at least 1200px wide so the story can appear with a large image in Google Discover and Top Stories.`
                        : true
                }).warning(),
            fields: [
                {
                    name: "alt",
                    type: "string",
                    title: "Photo description",
                    description: "Describe the photo for readers who can't see it. Also helps Google Images.",
                    validation: (Rule: any) =>
                        Rule.custom((alt: string | undefined, context: any) =>
                            context.parent?.asset && !alt?.trim() ? "Describe the photo before publishing" : true,
                        ),
                },
                {
                    name: "caption",
                    type: "string",
                    title: "Caption and credit",
                    description: "Shown under the photo on the story page, e.g. “Photo: supplied”",
                },
            ],
        },
        {
            name: "excerpt",
            title: "Summary",
            type: "text",
            rows: 3,
            // Same limit as the writer portal (components/write/story-form.tsx)
            description:
                "One or two sentences under the headline. Story cards show about the first 180 characters, so put the key point first. Up to 600 characters.",
            validation: (Rule: any) => [
                Rule.required().error("Add a summary before publishing"),
                Rule.max(600).error("Keep the summary under 600 characters"),
            ],
        },
        {
            name: "seoTitle",
            title: "Search headline (optional)",
            type: "string",
            fieldset: "search",
            description:
                "What Google and Bing show as the title. Use it when people search with words the headline leaves out, such as a full name: “Prophet Uebert Angel arrested…”. Leave empty to use the headline.",
            validation: (Rule: any) => Rule.max(70).warning("Search engines cut titles at about 60 characters"),
        },
        {
            name: "seoDescription",
            title: "Search description (optional)",
            type: "text",
            rows: 2,
            fieldset: "search",
            description:
                "The line under the title in search results: who, what, where, in plain words. Leave empty to use the summary.",
            validation: (Rule: any) => Rule.max(160).warning("Search engines show about 160 characters"),
        },
        {
            name: "categories",
            title: "Sections",
            type: "array",
            description: "The first section is the main one: it is shown on the story and decides where it appears",
            of: [{ type: "reference", to: { type: "category" } }],
            validation: (Rule: any) => Rule.required().min(1).error("Choose at least one section before publishing"),
        },
        {
            name: "region",
            title: "Region",
            type: "string",
            description: "Where the story is from. Decides the Zimbabwe, Africa and World pages it appears on.",
            options: {
                list: [
                    { title: "Zimbabwe", value: "zimbabwe" },
                    { title: "Africa", value: "africa" },
                    { title: "World", value: "world" },
                ],
                layout: "radio",
                direction: "horizontal",
            },
            validation: (Rule: any) => Rule.required().error("Choose a region before publishing"),
        },
        {
            // Same list as STORY_TYPES in lib/site/config.ts and the writer portal
            name: "storyType",
            title: "Story type",
            type: "string",
            description: "Shown as a label on the story, so readers can tell reporting from analysis and opinion",
            initialValue: "news",
            validation: (Rule: any) => Rule.required().error("Choose a story type"),
            options: {
                list: [
                    { title: "News", value: "news" },
                    { title: "Live updates", value: "live" },
                    { title: "Analysis", value: "analysis" },
                    { title: "Opinion", value: "opinion" },
                    { title: "Investigation", value: "investigation" },
                    { title: "Interview", value: "interview" },
                    { title: "Explainer", value: "explainer" },
                    { title: "Feature", value: "feature" },
                ],
            },
        },
        {
            name: "placement",
            title: "Homepage placement",
            type: "string",
            fieldset: "homepage",
            description:
                "Lead story: the large story at the top of the homepage (the newest active lead is used). Top story: pinned beside it. Normal: only in Latest news.",
            options: {
                list: [
                    { title: "Normal", value: "normal" },
                    { title: "Lead story", value: "lead" },
                    { title: "Top story", value: "top" },
                ],
                layout: "radio",
                direction: "horizontal",
            },
            initialValue: "normal",
        },
        {
            name: "topOrder",
            title: "Top story order",
            type: "number",
            fieldset: "homepage",
            description: "1 shows first. Leave empty to order top stories by publish time.",
            hidden: ({ document }: any) => document?.placement !== "top",
            validation: (Rule: any) => Rule.integer().min(1).max(10),
        },
        {
            name: "featuredUntil",
            title: "Featured until",
            type: "datetime",
            options: HARARE_TIME,
            fieldset: "homepage",
            description: "When the story leaves its lead or top position. Leave empty to keep it there until you change it.",
            hidden: ({ document }: any) => !document?.placement || document.placement === "normal",
        },
        {
            name: "breaking",
            title: "Breaking news",
            type: "boolean",
            fieldset: "homepage",
            description: "Shows a red BREAKING label on the story and puts it in the breaking band at the top of the homepage.",
            initialValue: false,
        },
        {
            name: "breakingUntil",
            title: "Breaking until",
            type: "datetime",
            options: HARARE_TIME,
            fieldset: "homepage",
            description: "When the BREAKING label comes off. Usually a few hours to a day after publishing.",
            hidden: ({ document }: any) => !document?.breaking,
            validation: (Rule: any) =>
                Rule.custom((value: string | undefined, context: any) =>
                    context.document?.breaking && !value ? "Choose when the story stops being breaking news" : true,
                ),
        },
        {
            name: "archived",
            title: "Archive story",
            type: "boolean",
            description:
                "Moves the story from Latest news to the Archive and labels it “Archive”, for earlier reporting whose facts may have changed",
            initialValue: false,
        },
        {
            name: "tags",
            title: "Tags",
            type: "array",
            description:
                "People, places, organisations and running stories, e.g. “Uebert Angel”, “ZESA”, “2028 elections”. Stories that share tags are shown together as related reading. Start typing to find a tag, or create a new one.",
            of: [{ type: "reference", to: { type: "tag" } }],
            validation: (Rule: any) => Rule.unique().error("That tag is already on the story"),
        },
        {
            name: "content",
            title: "Story text",
            type: "array",
            validation: (Rule: any) => Rule.required().error("Add the story text before publishing"),
            of: [
                {
                    type: "block",
                    // The story's headline is the page's only H1, so text headings start at H2
                    styles: [
                        { title: "Normal", value: "normal" },
                        { title: "Heading", value: "h2" },
                        { title: "Subheading", value: "h3" },
                        { title: "Quote", value: "blockquote" },
                    ],
                },
                {
                    type: "image",
                    options: {
                        hotspot: true,
                    },
                    fields: [
                        {
                            name: "alt",
                            type: "string",
                            title: "Photo description",
                            description: "Describe the photo for readers who can't see it. Also helps Google Images.",
                            validation: (Rule: any) =>
                                Rule.custom((alt: string | undefined, context: any) =>
                                    context.parent?.asset && !alt?.trim() ? "Describe the photo before publishing" : true,
                                ),
                        },
                        {
                            name: "caption",
                            type: "string",
                            title: "Caption and credit",
                            description: "Shown under the photo, e.g. “Photo: supplied”",
                        },
                    ],
                },
            ],
        },
        {
            name: "sources",
            title: "Sources & further reading",
            type: "array",
            description: "Listed at the end of the story",
            of: [
                {
                    type: "object",
                    fields: [
                        { name: "title", title: "Title", type: "string", validation: (Rule: any) => Rule.required() },
                        {
                            name: "url",
                            title: "Link",
                            type: "url",
                            validation: (Rule: any) => Rule.required().uri({ scheme: ["http", "https"] }),
                        },
                    ],
                    preview: { select: { title: "title", subtitle: "url" } },
                },
            ],
        },
        {
            name: "submittedBy",
            title: "Submitted by",
            type: "reference",
            to: { type: "author" },
            description: "Set automatically when a writer submits this story from the /write portal",
            readOnly: true,
        },
        // Review fields are only used while a submitted story is a draft. Publishing clears
        // them (sanity/actions/setPublishedAt.ts) so editor notes never become public.
        {
            name: "reviewStatus",
            title: "Review",
            type: "string",
            fieldset: "review",
            options: {
                list: [
                    { title: "Waiting for your review", value: "submitted" },
                    { title: "Changes requested: sent back to the writer", value: "changesRequested" },
                ],
                layout: "radio",
            },
        },
        {
            name: "editorNote",
            title: "Note to the writer",
            type: "text",
            rows: 4,
            fieldset: "review",
            description: "What should they change? They get it by email and see it in the writer portal. Leave the story unpublished.",
            validation: (Rule: any) =>
                Rule.custom((note: string | undefined, context: any) =>
                    context.document?.reviewStatus === "changesRequested" && !note?.trim()
                        ? "Tell the writer what to change"
                        : true,
                ),
        },
        {
            // Set by the writer portal when the writer resubmits, so the editor can check the
            // changes against what they asked for. Cleared on publish.
            name: "previousEditorNote",
            title: "Your last note",
            type: "text",
            rows: 3,
            fieldset: "review",
            readOnly: true,
            description: "What you asked for last time. The writer has resubmitted since.",
            hidden: ({ document }: any) => !document?.previousEditorNote,
        },
    ],

    fieldsets: [
        {
            name: "search",
            title: "Search engines",
            description: "Optional. How the story appears in Google and Bing results.",
            options: { collapsible: true, collapsed: true },
        },
        {
            name: "homepage",
            title: "Homepage placement",
            description: "Where the story appears on the homepage. Separate from the publish date, which never needs changing to move a story.",
            options: { collapsible: true, collapsed: false },
        },
        {
            name: "review",
            title: "Editor review",
            description: "Send this story back to the writer with a note, or publish it",
            hidden: ({ document }: any) => !document?.submittedBy,
        },
    ],

    preview: {
        select: {
            title: "title",
            author: "author.name",
            writer: "submittedBy.name",
            reviewStatus: "reviewStatus",
            placement: "placement",
            breaking: "breaking",
            breakingUntil: "breakingUntil",
            publishedAt: "publishedAt",
            media: "mainImage",
        },
        prepare(selection: Record<string, any>) {
            const { author, writer, reviewStatus, placement, breaking, breakingUntil, publishedAt, ...rest } = selection
            const scheduled =
                publishedAt > new Date().toISOString() &&
                `Scheduled for ${new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Harare", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(publishedAt))} CAT`
            const parts = [
                scheduled,
                breaking && breakingUntil > new Date().toISOString() && "BREAKING",
                placement === "lead" && "Lead story",
                placement === "top" && "Top story",
                reviewStatus === "changesRequested" && "Sent back",
                author && `by ${author}`,
                writer && writer !== author && `submitted by ${writer}`,
            ].filter(Boolean)
            return { ...rest, subtitle: parts.length ? parts.join(" · ") : undefined }
        },
    },
}
