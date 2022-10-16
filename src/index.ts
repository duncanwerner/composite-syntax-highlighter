
import { Highlighter } from './highlight.js';

/** remark/rehype plugin */
export { CompositePlugin, CombinedPlugin } from './plugins.js';

/** meta type for advanced formatting */
export type { Meta } from './meta.js';

/** direct calls for special rendering */
export { Highlighter } from './highlight.js';

/**
 * create an instance that we can cache, this will simplify
 * using it from an astro component
 * 
 * wait why does this not use the same instance as the markdown 
 * plugin? (...) actually that's by design, in case they have 
 * different configurations. 
 */
let instance: Highlighter;

export const GetInstance = () => {
  if (!instance) {
    instance = new Highlighter();
  }
  return instance;
}

/** pass through to simplify access */
export { toShikiTheme } from 'shiki';
