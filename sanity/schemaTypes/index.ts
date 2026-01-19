import type { SchemaTypeDefinition } from "sanity"
import { categoryType } from "./categoryType";
import { authorType } from "./authorType";
import newsItemType from "./newsItemType";
import { blockContentType } from "./blockContentType";



export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    categoryType,
    authorType,
    newsItemType
 
  ],
};
