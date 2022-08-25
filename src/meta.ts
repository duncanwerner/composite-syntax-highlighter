
import type { Element as HastElement } from 'hast';

/**
 * I don't think that's necessarily the right type...
 */
export type TreeProcessor = (root: HastElement) => void;

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
  postprocess?: Array<() => TreeProcessor>;

}

/**
 * parse a string representing an array, but we're flexible.
 * braces are not required. we also allow ranges (e.g. 3-6).
 * so legal values are
 * 
 * 3
 * [3]
 * [3,4]
 * 3,4
 * 3,4-6,10
 * 
 * but no spaces!
 * 
 * @param text 
 * @returns 
 */
const ParseArrayValue = (text = ''): number[] => {
  const result: number[] = [];

  if (/^\[.*?\]$/.test(text)) {
    text = text.substring(1, text.length - 1);
  }

  const parts = text.split(/,/g);
  for (const part of parts) {
    if (/-/.test(part)) {
      const [start, end] = part.split('-').map(value => Number(value)) as number[];

      // because I fucking said so
      if (typeof start === 'number' && typeof end === 'number') {

        if (start < end){
          for (let i = start; i <= end; i++){
            result.push(i);
          }
        }
        else {
          for (let i = start; i >= end; i--){
            result.push(i);
          }
        }
      }

    }
    else {
      result.push(Number(part));
    }
  }

  return result;
}

/**
 * parse a metadata string into an object
 * @param meta 
 * @returns 
 */
export const ParseMeta = (meta: string): Meta => {
  
  const result: Meta = {};
  const parts = meta.split(/\s+/g);
  
  for (const part of parts) {

    if (part === 'preserve-scopes') {
      result.preserve_scopes = true;
      continue;
    }

    if (/=/.test(part)) {
      const [key, value] = part.split('=').map(text => text.trim());
      switch (key) {
        case 'highlight':
          result.highlight = ParseArrayValue(value);
          continue;

        case 'show':
          result.show = ParseArrayValue(value);
          continue;

        case 'hide':
          result.hide = ParseArrayValue(value);
          continue;
      }
      console.info({key, value});
    }

    console.info('unhandled meta data:', part);
    
  }


  return result;

};