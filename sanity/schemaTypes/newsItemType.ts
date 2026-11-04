export default {
    name: "newsItem",
    title: "News",
    type: "document",
    fields: [
        {
            name: "title",
            title: "Title",
            type: "string",
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: "slug",
            title: "Slug",
            type: "slug",
            options: {
                source: "title",
                maxLength: 96,
            },
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: "publishedAt",
            title: "Published at",
            type: "datetime",
            description: "Set automatically the first time you publish. Change it here to backdate or correct it.",
        },
        {
            name: "readTime",
            title: "Read Time",
            type: "string",
            description: 'Estimated reading time (e.g., "3 min")',
            validation: (Rule: any) => Rule.required(),
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
            of: [{ type: "reference", to: { type: "tag" } }],
        },
        {
            name: "content",
            title: "Content",
            type: "array",
            of: [
                { type: "block" },
                {
                    type: "image",
                    options: {
                        hotspot: true,
                    },
                    fields: [
                        {
                            name: "alt",
                            type: "string",
                            title: "Alternative text",
                            description: "Important for SEO and accessibility",
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
            name: "trending",
            title: "Trending",
            type: "boolean",
            description: "Mark this article as trending",
            initialValue: false,
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
            description: "What should they change? They see this in the writer portal.",
            validation: (Rule: any) =>
                Rule.custom((note: string | undefined, context: any) =>
                    context.document?.reviewStatus === "changesRequested" && !note?.trim()
                        ? "Tell the writer what to change"
                        : true,
                ),
        },
    ],

    fieldsets: [
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
            media: "mainImage",
        },
        prepare(selection: Record<string, any>) {
            const { author, writer, reviewStatus, ...rest } = selection
            const parts = [
                reviewStatus === "changesRequested" && "Sent back",
                author && `by ${author}`,
                writer && writer !== author && `submitted by ${writer}`,
            ].filter(Boolean)
            return { ...rest, subtitle: parts.length ? parts.join(" · ") : undefined }
        },
    },
}
