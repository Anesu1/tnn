import { saveItemAction } from "@/app/desk/actions"
import { ActionForm, FormFooter, SubmitButton } from "@/components/desk/action-form"
import { PlatformChecks } from "@/components/desk/repeat-rows"
import { formatDay, KINDS, PIPELINE_KINDS, PRIORITIES, STAGES, STATUSES } from "@/lib/desk/config"
import type { Item } from "@/lib/desk/data"
import type { WebStory } from "@/lib/desk/sanity"

// Add or edit one tracker item. Pipeline fields appear only for documentaries and special reports.
export function ItemForm({ item, people, stories, plannedWeek }: { item?: Item; people: string[]; stories: WebStory[]; plannedWeek?: string }) {
  return (
    <ActionForm action={saveItemAction}>
      {item && <input type="hidden" name="id" value={item.id} />}
      {item?.sanity_id && <input type="hidden" name="linked_story" value={item.sanity_id} />}
      {plannedWeek && <input type="hidden" name="planned_week" value={plannedWeek} />}

      <label htmlFor="title">Title</label>
      <input id="title" name="title" defaultValue={item?.title} maxLength={200} required autoFocus={!item} />

      <div className="grid-3">
        <label>
          Type
          <select id="kind" name="kind" defaultValue={item?.kind ?? "story"}>
            {Object.entries(KINDS).map(([value, name]) => (
              <option key={value} value={value} data-pipeline={PIPELINE_KINDS.includes(value as never) ? "" : undefined}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select name="status" defaultValue={item?.status ?? "planned"}>
            {Object.entries(STATUSES).map(([value, name]) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Priority
          <select name="priority" defaultValue={item?.priority ?? "normal"}>
            {Object.entries(PRIORITIES).map(([value, name]) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="pipeline-only">
        <label>
          Production stage
          <select name="stage" defaultValue={item?.stage ?? "idea"}>
            {Object.entries(STAGES).map(([value, name]) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid-2">
        <label>
          Deadline
          <input name="deadline" type="date" defaultValue={item?.deadline ?? ""} />
        </label>
        <label>
          Format
          <span className="hint">e.g. News story, explainer, 3-minute video</span>
          <input name="format" defaultValue={item?.format ?? ""} maxLength={120} />
        </label>
      </div>

      <PlatformChecks name="platforms" selected={item?.platforms} />

      <div className="grid-3">
        <label>
          Lead
          <input name="lead" list="desk-people" defaultValue={item?.lead ?? ""} maxLength={120} />
        </label>
        <label>
          Owner
          <span className="hint">Who is responsible for the next step</span>
          <input name="owner" list="desk-people" defaultValue={item?.owner ?? ""} maxLength={120} />
        </label>
        <label>
          Contributors
          <input name="contributors" defaultValue={item?.contributors ?? ""} maxLength={400} placeholder="Names, separated by commas" />
        </label>
      </div>
      <datalist id="desk-people">
        {people.map((person) => (
          <option key={person} value={person} />
        ))}
      </datalist>

      <label>
        Next action
        <input name="next_action" defaultValue={item?.next_action ?? ""} maxLength={500} placeholder="The very next thing that needs to happen" />
      </label>

      <label className="check" style={{ marginTop: 16 }}>
        <input type="checkbox" id="blocked" name="blocked" defaultChecked={item?.blocked} />
        <strong>Blocked</strong>, work can’t move until something is resolved. The CEO is alerted.
      </label>
      <div className="blocker-field">
        <label>
          What is blocking it?
          <textarea name="blocker" defaultValue={item?.blocker ?? ""} maxLength={1000} style={{ minHeight: 70 }} />
        </label>
      </div>

      <label>
        Risks
        <span className="hint">Anything that could delay it or affect quality</span>
        <textarea name="risk" defaultValue={item?.risk ?? ""} maxLength={1000} style={{ minHeight: 70 }} />
      </label>

      <label>
        Success measure
        <input name="success_measure" defaultValue={item?.success_measure ?? ""} maxLength={300} />
      </label>

      <div className="grid-2">
        <label>
          Published on the website
          <span className="hint">Linking a live story fills in the link and marks it published</span>
          <select name="story" defaultValue={item?.sanity_id ?? ""}>
            <option value="">Not linked</option>
            {item?.sanity_id && !stories.some((story) => story.id === item.sanity_id) && (
              <option value={item.sanity_id}>The story linked earlier</option>
            )}
            {stories.map((story) => (
              <option key={story.id} value={story.id}>
                {formatDay(story.publishedAt.slice(0, 10))} · {story.title.slice(0, 80)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Published link or other evidence
          <span className="hint">YouTube, Facebook, a shared folder…</span>
          <input name="evidence_url" type="text" inputMode="url" defaultValue={item?.evidence_url ?? ""} maxLength={500} placeholder="https://" />
        </label>
      </div>

      <FormFooter sticky>
        <SubmitButton>{item ? "Save changes" : "Add to tracker"}</SubmitButton>
      </FormFooter>
    </ActionForm>
  )
}
