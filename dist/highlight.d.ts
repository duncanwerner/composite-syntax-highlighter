import type { HighlighterOptions } from 'shiki';
import type { Meta } from './meta';
/**
 * this is a class so we can isolate instances that have (possibly)
 * different configs. a single config can have multiple themes, so
 * that's not why.
 */
export declare class Highlighter {
    private static default_config;
    /**
     * single instance of highlighter, because they are expensive.
     * lazily cached.
     */
    private cached_highlighter?;
    /** why is this private? */
    private config;
    /**
     * set the shiki config. this has to happen before it's used,
     * because we will cache the highlighter instance.
     */
    SetConfig(config: HighlighterOptions): void;
    /**
     * get highlighter, lazily cached. we don't check for changes
     * in config, it's assumed it will be constant. at a minimum we
     * could error?
     */
    private GetHighlighter;
    /**
     * render to tokens, preserving scopes
     * FIXME: override themes, for subset?
     */
    private RenderTokens;
    private FormatLine;
    /**
     * composite method for rendering tokens and then formatting
     */
    Highlight(text: string, language: string, meta?: Meta): Promise<any[]>;
    /**
     * if there's no language, don't render tokens; just reflect back
     * the original text.
     */
    private NullFormat;
    /**
     * format tokens into a block. we return an array of <pre/> elements
     */
    private FormatTokens;
}
