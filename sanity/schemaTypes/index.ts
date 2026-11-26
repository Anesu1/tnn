import type { SchemaTypeDefinition } from "sanity"

import authorType from "./authorType"
import { categoryType } from "./categoryType"
import { episodeType } from "./episodeType"
import newsItemType from "./newsItemType"
import { programmeType } from "./programmeType"
import tagType from "./tagType"

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [newsItemType, authorType, categoryType, tagType, programmeType, episodeType],
}
