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
    /**
     * postprocessors; these are (basically) rehype plugins, but only operate
     * on the generated code nodes.
     */
    postprocess?: Array<() => (tree: any) => void>;
}
/**
 * parse a metadata string into an object
 * @param meta
 * @returns
 */
export declare const ParseMeta: (meta: string) => Meta;
