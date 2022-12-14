import { Highlighter } from './highlight.js';
/** remark/rehype plugin */
export { CompositePlugin, CombinedPlugin } from './plugins.js';
/** meta type for advanced formatting */
export type { Meta } from './meta.js';
/** direct calls for special rendering */
export { Highlighter } from './highlight.js';
export declare const GetInstance: () => Highlighter;
/** pass through to simplify access */
export { toShikiTheme } from 'shiki';
