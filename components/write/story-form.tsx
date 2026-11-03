"use client"

import Link from "next/link"
import { useActionState } from "react"

import { saveStoryAction, type FormState } from "@/app/write/actions"

export type StoryFormValues = {
  id?: string
  title?: string
  excerpt?: string
  content?: string
  categories?: string[]
  region?: string
  image?: string
  imageAlt?: string
}

const REGIONS = [
  { value: "zimbabwe", title: "Zimbabwe" },
  { value: "africa", title: "Africa" },
  { value: "world", title: "World" },
]

type Props = {
  categories: { _id: string; title: string }[]
  initial?: StoryFormValues
  // The story was sent back with changes requested, so saving resubmits it
  resubmit?: boolean
}

export function StoryForm({ categories, initial = {}, resubmit = false }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveStoryAction, {})
  const selected = new Set(initial.categories ?? [])

  return (
    <form action={formAction} className="form">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      <label htmlFor="title">Headline</label>
      <input id="title" name="title" className="headline" defaultValue={initial.title} required maxLength={160} />

      <label htmlFor="excerpt">
        Summary
        <span className="hint">One or two sentences shown under the headline on the homepage. Up to 200 characters.</span>
      </label>
      <textarea id="excerpt" name="excerpt" defaultValue={initial.excerpt} maxLength={200} required />

      {categories.length > 0 && (
        <fieldset style={{ border: 0, padding: 0, margin: "20px 0 0" }}>
          <legend style={{ fontSize: 14, fontWeight: "bold" }}>
            Sections
            <span className="hint">Choose at least one. The chief editor confirms the main section when publishing.</span>
          </legend>
          <div className="checks">
            {categories.map((category) => (
              <label key={category._id}>
                <input
                  type="checkbox"
                  name="categories"
                  value={category._id}
                  defaultChecked={selected.has(category._id)}
                />
                {category.title}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset style={{ border: 0, padding: 0, margin: "20px 0 0" }}>
        <legend style={{ fontSize: 14, fontWeight: "bold" }}>
          Region
          <span className="hint">Where the story is from.</span>
        </legend>
        <div className="checks">
          {REGIONS.map((region) => (
            <label key={region.value}>
              <input
                type="radio"
                name="region"
                value={region.value}
                defaultChecked={initial.region === region.value}
                required
              />
              {region.title}
            </label>
          ))}
        </div>
      </fieldset>

      <label htmlFor="image">
        Main photo
        <span className="hint">
          {initial.image ? "Choose a new file to replace the current photo." : "JPG or PNG, up to 10 MB."}
        </span>
      </label>
      {initial.image && <img src={`${initial.image}?w=440&h=275&fit=crop`} alt="" className="current-photo" />}
      <input id="image" name="image" type="file" accept="image/*" />

      <label htmlFor="imageAlt">
        Photo description
        <span className="hint">Required if you add a photo. Describe it for readers who can&apos;t see it.</span>
      </label>
      <input id="imageAlt" name="imageAlt" defaultValue={initial.imageAlt} maxLength={200} />

      <label htmlFor="content">
        Story
        <span className="hint">Start a new line for each paragraph.</span>
      </label>
      <textarea id="content" name="content" className="story-body" defaultValue={initial.content} required />

      {state.error && (
        <p className="error" role="alert">
          {state.error}
        </p>
      )}

      <div className="form-actions">
        <button className="button" disabled={pending}>
          {pending ? "Saving…" : resubmit ? "Resubmit for approval" : initial.id ? "Save changes" : "Submit for approval"}
        </button>
        <Link href="/write" className="button outline">
          Cancel
        </Link>
      </div>
    </form>
  )
}
