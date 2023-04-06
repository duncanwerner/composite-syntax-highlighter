
import { getHighlighter } from 'shiki';
import type { IShikiTheme, Highlighter as ShikiHighlighter, HighlighterOptions } from 'shiki';
import { FontStyle, type IThemedToken } from 'shiki';
import { h } from 'hastscript';
import type { Meta } from './meta';
import type { Element as HastElement } from 'hast';

interface ThemedTokens {
  theme: IShikiTheme;
  lines: IThemedToken[][];
}

/**
 * this is a class so we can isolate instances that have (possibly)
 * different configs. a single config can have multiple themes, so
 * that's not why.
 */
export class Highlighter {

  private static default_config: HighlighterOptions = {
    themes: [
      'light-plus', 
      'dark-plus',
    ],
  };

  /** 
   * single instance of highlighter, because they are expensive.
   * lazily cached.
   */
  private cached_highlighter?: ShikiHighlighter | undefined;

  /** why is this private? */
  private config: HighlighterOptions = Highlighter.default_config;

  /** 
   * set the shiki config. this has to happen before it's used,
   * because we will cache the highlighter instance.
   * 
   * actually if we want to support changing configs at runtime,
   * which is what can happen in svelte (for example), we should
   * flush the cached instance here.
   */
  public SetConfig(config: HighlighterOptions) {

    // if the config hasn't changed we don't have to flush 
    // the cached instance

    if (this.cached_highlighter &&
        (JSON.stringify(this.config) === JSON.stringify(config))) {
      return;
    }

    this.config = config;
    this.cached_highlighter = undefined;

  }

  /**
   * get highlighter, lazily cached. we don't check for changes
   * in config, it's assumed it will be constant. at a minimum we 
   * could error?
   */
  private async GetHighlighter(config?: HighlighterOptions): Promise<ShikiHighlighter> {
    if (config) {
      this.SetConfig(config);
    }
    if (!this.cached_highlighter) {
      this.cached_highlighter = await getHighlighter(this.config);
    }
    return this.cached_highlighter;
  }

  /**
   * render to tokens, preserving scopes
   * FIXME: override themes, for subset?
   */
  private async RenderTokens(content: string, lang: string): Promise<ThemedTokens[]> {

    const highlighter = await this.GetHighlighter();
    const languages = highlighter.getLoadedLanguages() as string[];

    if (!languages.includes(lang)) {
      console.warn(`language definition not found for ${lang}`);
      lang = undefined;
    }
    
    return (this.config.themes||[]).map(name => {
      const theme = highlighter.getTheme(name);
      return {
        theme,
        lines: highlighter.codeToThemedTokens(content, lang, name as string),
      };
    });

  }

  private FormatLine(line: IThemedToken[] = [], theme: IShikiTheme, line_classes = '') {

    return h('div', { class: ['line', line_classes]}, [...line.map(token => {

      // we need a map or list of interesting scopes or something
      // actually it looks like scope is a narrowing process...
      // we can key in on scopes we're interested in

      // actually slightly more complicated; sometimes there are multiple
      // tokens in one block, like a tag <html> can either be three tokens
      // or one token with three scopes.

      const scopes: string[] = (token.explanation || []).map(({scopes}) => scopes[scopes.length - 1]?.scopeName || '');

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
        'data-scope': scopes.length ? scopes.join(',') :undefined }, token.content || '');

      }), '\n']); // <-- note that newline; it fixes copy+paste for empty lines

  };

  /**
   * composite method for rendering tokens and then formatting
   */
  public async Highlight(text: string, language: string, meta: Meta = {}) {

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
  private async NullFormat(text: string, meta: Meta = {}) {

    const highlighter = await this.GetHighlighter();

    const rendered = (this.config.themes || []).map(name => {
      const theme = highlighter.getTheme(name);
      const root = h('pre', { class: ['shiki', theme.name], style: { 'background-color': theme.bg }}, 
          h('div', { class: 'code-container' }, 
          h('code', { style: { 'color': theme.fg } }, text
        )));

      return root;
    });

    return rendered;

  }

  /**
   * format tokens into a block. we return an array of <pre/> elements
   */
  private FormatTokens(formatted: ThemedTokens[], meta: Meta = {}) {

    return formatted.map(block => {

      const { theme, lines } = block;
  
      let root: HastElement|undefined;
    
      if (typeof meta.inline !== 'undefined' && meta.inline !== false) {
        const index = (typeof meta.inline === 'number') ? meta.inline : 0;
        root = h('div', { class: ['shiki', theme.name]}, [ this.FormatLine(lines[index], theme)]);
      }
      else {

        root = h('pre', { 
                  class: ['shiki', theme.name], 
                  style: { 'background-color': theme.bg },
                  ...(meta.data_attributes||{}),
                }, 
                h('div', { class: 'code-container' }, 
                  h('code', {}, lines.map((line, index) => {

            // can explicitly show lines, or explicitly hide lines
            if ((meta.show && !meta.show.includes(index))
                || (meta.hide && meta.hide.includes(index))) {
    
              return;
            }
    
            const highlight = (meta.highlight && meta.highlight.includes(index));
            return this.FormatLine(line, theme, highlight ? 'highlight-line' : undefined);
          
          }))));
    
      }
    
      if (root && meta.postprocess) {
        for (const step of meta.postprocess) {
          const func = step();
          func.call(0, root);
        }
      }

      // remove scopes, unless you specficially ask to keep them. we only
      // kept them up til now for the postprocessors.
    
      if (!meta.preserve_scopes) {
    
        const visit = ((node: HastElement) => {
          if (node.properties) {
            node.properties.dataScope = undefined;
          }
          for (const child of node.children || []) {
            visit(child as HastElement); // could be "raw" -- is there a type guard?
          }
        });
        
        visit(root);
    
      }
    
      return root;
    
    });

  }

}
