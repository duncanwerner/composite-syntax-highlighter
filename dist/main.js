import { ParseMeta } from './meta.js';
import * as he from 'he';
import { FormatTokens, RenderTokens as RenderTokens2, SetConfig } from './highlight.js';
import { h } from 'hastscript';
import { toHtml as render_html } from 'hast-util-to-html';
/**
 * this is a remark plugin that handles code blocks, but doesn't
 * format them: it only adds some metadata so we can process it
 * later.
 */
const PreserveAttributes = () => {
    return (tree) => {
        tree.children = tree.children.map(child => {
            if (child.type === 'code') {
                // OK we're overcomplicating this but I hate writing html in strings
                const replacement = h('pre', {
                    'data-code-block': true,
                    'data-lang': child.lang || 'unknown',
                    'data-meta': child.meta || false,
                }, h('code', { class: `language-` + (child.lang || 'unknown') }, child.value));
                return {
                    type: 'html',
                    value: render_html(replacement),
                };
            }
            return child;
        });
    };
};
/**
 * this is a rehype plugin that takes our marked code blocks and does
 * the actual highlighting.
 */
const HighlightBlocks = (config) => {
    if (config) {
        SetConfig(config);
    }
    const ProcessTree = async (tree) => {
        switch (tree.type) {
            case 'text':
            case 'comment':
            case 'doctype':
                return;
        }
        if (!tree.children) {
            return;
        }
        const children = [];
        for (const child of tree.children) {
            if (child.type === 'element' &&
                child.tagName === 'pre' &&
                child.properties?.dataCodeBlock !== undefined) {
                const language = child.properties.dataLang ? child.properties.dataLang.toString() : 'unknown';
                const meta = child.properties.dataMeta ? ParseMeta(child.properties.dataMeta.toString()) : undefined;
                for (const element of (child.children)) {
                    if (element.type === 'element' && element.tagName === 'code') {
                        const text = (element.children || []).map((child) => {
                            if (child.type === 'text') {
                                return child.value;
                            }
                            return '';
                        }).join('');
                        const tokens = await RenderTokens2(he.default.decode(text), language);
                        const formatted = FormatTokens(tokens, meta);
                        children.push(...formatted);
                    }
                }
            }
            else {
                ProcessTree(child);
                children.push(child);
            }
        }
        tree.children = children;
    };
    return async (tree) => {
        await ProcessTree(tree);
    };
};
export const CompositePlugin = {
    rehype: HighlightBlocks,
    remark: PreserveAttributes,
};
