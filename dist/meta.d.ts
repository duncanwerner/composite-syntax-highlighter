import type { Element as HastElement } from 'hast';
/**
 * I don't think that's necessarily the right type...
 */
export declare type TreeProcessor = (root: HastElement) => void;
/**
 * metadata object for passing to parser
 */
export interface Meta {
    /** hide selected lines (0-based) */
    hide?: number[];
    /** show only selected lines (0-based) */
    show?: number[];
    /** add a highlight class to the selected lines */
    highlight?: number[];
    /** leave scopes in as data-scope attribute */
    preserve_scopes?: boolean;
    /** inline code. can be a line number if the actual text is multi-line */
    inline?: boolean | number;
    /** optional data-* attributes */
    data_attributes?: Record<string, string | true>;
    /**
     * postprocessors; these are (basically) rehype plugins, but only operate
     * on the generated code nodes.
     */
    postprocess?: Array<() => TreeProcessor>;
}
/**
 * parse a metadata string into an object
 * @param meta
 * @returns
 */
export declare const ParseMeta: (meta: string) => Meta;
