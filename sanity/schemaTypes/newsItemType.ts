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
            validation: (Rule: any) => Rule.required(),
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
                    title: "Alternative text",
                    description: "Important for SEO and accessibility",
                },
            ],
        },
        {
            name: "excerpt",
            title: "Excerpt",
            type: "text",
            description: "A short summary that appears under the title in the hero section",
        },
        {
            name: "categories",
            title: "Categories",
            type: "array",
            of: [{ type: "reference", to: { type: "category" } }],
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
            to: { type: "writer" },
            description: "Set automatically when a writer submits this story from the /write portal",
            readOnly: true,
        },
    ],

    preview: {
        select: {
            title: "title",
            author: "author.name",
            writer: "submittedBy.name",
            media: "mainImage",
        },
        prepare(selection: Record<string, any>) {
            const { author, writer, ...rest } = selection
            const parts = [author && `by ${author}`, writer && `submitted by ${writer}`].filter(Boolean)
            return { ...rest, subtitle: parts.length ? parts.join(" · ") : undefined }
        },
    },
}
