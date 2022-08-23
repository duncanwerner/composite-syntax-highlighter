import { getHighlighter } from 'shiki';
import { FontStyle } from 'shiki';
import { h } from 'hastscript';
/**
 * this is a class so we can isolate instances that have (possibly)
 * different configs. a single config can have multiple themes, so
 * that's not why.
 */
export class Highlighter {
    static default_config = {
        themes: [
            'light-plus',
            'dark-plus',
        ],
    };
    /**
     * single instance of highlighter, because they are expensive.
     * lazily cached.
     */
    cached_highlighter;
    /** why is this private? */
    config = Highlighter.default_config;
    /**
     * set the shiki config. this has to happen before it's used,
     * because we will cache the highlighter instance.
     */
    SetConfig(config) {
        this.config = config;
    }
    ;
    /**
     * get highlighter, lazily cached. we don't check for changes
     * in config, it's assumed it will be constant. at a minimum we
     * could error?
     */
    async GetHighlighter() {
        if (!this.cached_highlighter) {
            this.cached_highlighter = await getHighlighter(this.config);
        }
        return this.cached_highlighter;
    }
    ;
    /**
     * render to tokens, preserving scopes
     * FIXME: override themes, for subset?
     */
    async RenderTokens(content, lang) {
        const highlighter = await this.GetHighlighter();
        const languages = highlighter.getLoadedLanguages();
        if (!languages.includes(lang)) {
            console.warn(`language definition not found for ${lang}`);
            lang = undefined;
        }
        return (this.config.themes || []).map(name => {
            const theme = highlighter.getTheme(name);
            return {
                theme,
                lines: highlighter.codeToThemedTokens(content, lang, name),
            };
        });
    }
    ;
    FormatLine(line = [], theme, line_classes = '') {
        return h('div', { class: ['line', line_classes] }, [...line.map(token => {
                // we need a map or list of interesting scopes or something
                // actually it looks like scope is a narrowing process...
                // we can key in on scopes we're interested in
                // actually slightly more complicated; sometimes there are multiple
                // tokens in one block, like a tag <html> can either be three tokens
                // or one token with three scopes.
                const scopes = (token.explanation || []).map(({ scopes }) => scopes[scopes.length - 1]?.scopeName || '');
                const cssDeclarations = [`color: ${token.color || theme.fg}`];
                const fontStyle = token.fontStyle ?? FontStyle.NotSet;
                if (fontStyle & FontStyle.Italic) {
                    cssDeclarations.push('font-style: italic');
                }
                if (fontStyle & FontStyle.Bold) {
                    cssDeclarations.push('font-weight: bold');
                }
                if (fontStyle & FontStyle.Underline) {
                    cssDeclarations.push('text-decoration: underline');
                }
                // FIXME: not escaping here. problem?
                // I don't know if it will merge style arrays properly. test? or just do it
                return h(`span`, { style: cssDeclarations.join('; '),
                    'data-scope': scopes.length ? scopes.join(',') : undefined }, token.content || '');
            }), '\n']); // <-- note that newline; it fixes copy+paste for empty lines
    }
    ;
    /**
     * composite method for rendering tokens and then formatting
     */
    async Highlight(text, language, meta = {}) {
        // better handling for blocks with no language specifier.  we want 
        // to maintain our node structure, so the styling doesn't change. 
        // we'll add our specific nodes and then reflect back the original source.
        // TODO: have a default language in config?
        if (!language || language === 'unknown') {
            return await this.NullFormat(text, meta);
        }
        return this.FormatTokens(await this.RenderTokens(text, language), meta);
    }
    /**
     * if there's no language, don't render tokens; just reflect back
     * the original text.
     */
    async NullFormat(text, meta = {}) {
        const highlighter = await this.GetHighlighter();
        const rendered = (this.config.themes || []).map(name => {
            const theme = highlighter.getTheme(name);
            const root = h('pre', { class: ['shiki', theme.name], style: { 'background-color': theme.bg } }, h('div', { class: 'code-container' }, h('code', { style: { 'color': theme.fg } }, text)));
            return root;
        });
        return rendered;
    }
    /**
     * format tokens into a block. we return an array of <pre/> elements
     */
    FormatTokens(formatted, meta = {}) {
        return formatted.map(block => {
            const { theme, lines } = block;
            let root;
            if (typeof meta.inline !== 'undefined' && meta.inline !== false) {
                const index = (typeof meta.inline === 'number') ? meta.inline : 0;
                root = h('div', { class: ['shiki', theme.name] }, [this.FormatLine(lines[index], theme)]);
            }
            else {
                root = h('pre', { class: ['shiki', theme.name], style: { 'background-color': theme.bg } }, h('div', { class: 'code-container' }, h('code', {}, lines.map((line, index) => {
                    // can explicitly show lines, or explicitly hide lines
                    if ((meta.show && !meta.show.includes(index))
                        || (meta.hide && meta.hide.includes(index))) {
                        return;
                    }
                    const highlight = (meta.highlight && meta.highlight.includes(index));
                    return this.FormatLine(line, theme, highlight ? 'highlight-line' : undefined);
                }))));
            }
            if (meta.postprocess) {
                for (const step of meta.postprocess) {
                    const func = step();
                    func.call(0, root);
                }
            }
            // remove scopes, unless you specficially ask to keep them. we only
            // kept them up til now for the postprocessors.
            if (!meta.preserve_scopes) {
                const visit = ((node) => {
                    if (node.properties) {
                        node.properties.dataScope = undefined;
                    }
                    for (const child of node.children || []) {
                        visit(child); // could be "raw" -- is there a type guard?
                    }
                });
                visit(root);
            }
            return root;
        });
    }
}
