import type { HighlighterOptions } from 'shiki';
import type { Root as HastRoot } from 'hast';
import type { Parent as MdastParent } from 'mdast';
export declare const CompositePlugin: {
    rehype: (config?: HighlighterOptions) => (tree: HastRoot) => Promise<void>;
    remark: () => (tree: MdastParent) => void;
};
