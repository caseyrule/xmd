import * as markdownIt from 'markdown-it';
import { BlockRuler, InlineRuler, RuleChain, Ruler, RenderRule } from './rules';
import { State, BlockState, InlineState } from './states';
import { Token, TokenStream } from './tokens';
import { LinkifyIt } from './linkify';

export * from './rules';
export * from './states';
export * from './tokens';
export * from './linkify';

/**
 * Type definitions for markdown-it
 *
 * Project: https://github.com/markdown-it/markdown-it
 * Based on definitions by: York Yao <https://github.com/plantain-00/>, Robert Coie <https://github.com/rapropos>
 *
 * @see https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md
 */
export interface MarkdownIt {
  block: BlockParser;
  core: {
    ruler: Ruler<'core'>;
    process(state: State<'core'>): void;
  };
  helpers: any;
  inline: InlineParser;
  linkify: LinkifyIt;
  renderer: Renderer;
  utils: {
    assign(obj: any): any;
    isString(obj: any): boolean;
    has(object: any, key: string): boolean;
    unescapeMd(str: string): string;
    unescapeAll(str: string): string;
    isValidEntityCode(str: any): boolean;
    fromCodePoint(str: string): string;
    escapeHtml(str: string): string;
    arrayReplaceAt(src: any[], pos: number, newElements: any[]): any[];
    isSpace(str: any): boolean;
    isWhiteSpace(str: any): boolean;
    isMdAsciiPunct(str: any): boolean;
    isPunctChar(str: any): boolean;
    escapeRE(str: string): string;
    normalizeReference(str: string): string;
  };
  render(md: string, env?: object): string;
  renderInline(md: string, env?: object): string;
  parse(src: string, env: object): TokenStream;
  parseInline(src: string, env: object): TokenStream;
  use(plugin: any, ...params: any[]): MarkdownIt;
  disable(rules: string[] | string, ignoreInvalid?: boolean): MarkdownIt;
  enable(rules: string[] | string, ignoreInvalid?: boolean): MarkdownIt;
  set(options: Options): MarkdownIt;
  normalizeLink(url: string): string;
  normalizeLinkText(url: string): string;
  validateLink(url: string): boolean;
}

export interface Options {
  html?: boolean;
  xhtmlOut?: boolean;
  breaks?: boolean;
  langPrefix?: string;
  linkify?: boolean;
  typographer?: boolean;
  quotes?: string;
  highlight?: (str: string, lang: string) => void;
}

export interface Renderer {
  rules: { [name: string]: RenderRule };
  render(tokens: TokenStream, options: any, env: object): string;
  renderAttrs(token: Token): string;
  renderInline(tokens: TokenStream, options: any, env: object): string;
  renderToken(tokens: TokenStream, idx: number, options: any): string;
}

export interface BlockParser {
  ruler: BlockRuler;
  parse(src: string, md: MarkdownIt, env: object, outTokens: TokenStream): void;
}

export interface InlineParser {
  ruler: InlineRuler;
  ruler2: InlineRuler;
  parse(src: string, md: MarkdownIt, env: object, outTokens: TokenStream): void;
}

interface MarkdownItConstructor {
  new (options?: Options): MarkdownIt;
  new (presetName: 'commonmark' | 'zero' | 'default', options?: Options): MarkdownIt;
  (options?: Options): MarkdownIt;
  (presetName: 'commonmark' | 'zero' | 'default', options?: Options): MarkdownIt;
}

export declare const MarkdownIt: MarkdownItConstructor;

export default markdownIt;
