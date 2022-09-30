import type { HighlighterOptions } from 'shiki';
import type { Root as HastRoot } from 'hast';
import type { Parent as MdastParent } from 'mdast';
/**
 * single-instance plugin. does the syntax highlighting into a
 * HAST tree, applies any postprocessors, then pastes the output
 * html into markdown. this is a remark plugin.
 *
 * @see README
 */
export declare const CombinedPlugin: (config?: HighlighterOptions) => (tree: MdastParent) => Promise<void>;
export declare const CompositePlugin: {
    rehype: (config?: HighlighterOptions) => (tree: HastRoot) => Promise<void>;
    remark: () => (tree: MdastParent) => void;
};
