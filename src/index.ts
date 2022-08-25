
import { Highlighter } from './highlight.js';

/** remark/rehype plugin */
export { CompositePlugin } from './plugins.js';

/** meta type for advanced formatting */
export type { Meta } from './meta.js';

/** direct calls for special rendering */
export { Highlighter } from './highlight.js';

/**
 * create an instance that we can cache, this will simplify
 * using it from an astro component
 */
let singleton: Highlighter;

export const GetInstance = () => {
  if (!singleton) {
    singleton = new Highlighter();
  }
  return singleton;
}
