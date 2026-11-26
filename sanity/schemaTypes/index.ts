import type { SchemaTypeDefinition } from "sanity"
import { categoryType } from "./categoryType";

import newsItemType from "./newsItemType";
import { blockContentType } from "./blockContentType";
import authorType from "./authorType";
import tagType from "./tagType";
import liveStreamType from "./liveStreamType";
import writerType from "./writerType";
import { programmeType } from "./programmeType";
import { episodeType } from "./episodeType";



export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    categoryType,
    authorType,
    newsItemType,
    tagType,
    liveStreamType,
    writerType,
    programmeType,
    episodeType,

  ],
};
