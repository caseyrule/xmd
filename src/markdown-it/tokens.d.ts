export interface Token {
  /**
   * @constructor
   *
   * @param {string} type - Type of the token (string, e.g. "paragraph_open")
   * @param {string} tag - html tag name, e.g. "p"
   * @param {TokenNesting} nesting - the resulting level change
   */
  new: (type: string, tag: string, nesting: TokenNesting) => Token;
  /**
   * Get the value of attribute `name`, or null if it does not exist.
   */
  attrGet: (name: string) => string | null;
  /**
   * Search attribute index by name.
   */
  attrIndex: (name: string) => number;
  /**
   *
   * Join value to existing attribute via space. Or create new attribute if not
   * exists. Useful to operate with token classes.
   */
  attrJoin: (name: string, value: string) => void;
  /**
   *
   * Add `[ name, value ]` attribute to list. Init attrs if necessary
   */
  attrPush: (attrData: string[]) => void;
  /**
   * Token.attrGet(name)
   *
   * Get the value of attribute `name`, or null if it does not exist.
   */
  attrSet: (name: string, value: string) => void;
  /**
   * Html attributes. Format: `[ [ name1, value1 ], [ name2, value2 ] ]`
   */
  attrs: string[][];
  /**
   * True for block-level tokens, false for inline tokens.
   * Used in renderer to calculate line breaks
   */
  block: boolean;
  /**
   * An array of child nodes (inline and img tokens)
   */
  children: Token[];
  /**
   * In a case of self-closing tag (code, html, fence, etc.),
   * it has contents of this tag.
   */
  content: string;
  /**
   * If it's true, ignore this element when rendering. Used for tight lists
   * to hide paragraphs.
   */
  hidden: boolean;
  /**
   * fence infostring
   */
  info: string;
  /**
   * nesting level, the same as `state.level`
   */
  level: number;
  /**
   * Source map info. Format: `[ line_begin, line_end ]`
   */
  map: number[];
  /**
   * '*' or '_' for emphasis, fence string for fence, etc.
   */
  markup: string;
  /**
   * A place for plugins to store an arbitrary data
   */
  meta: object;
  /**
   * Level change (number in {-1, 0, 1} set), where:
   *
   * -  `1` means the tag is opening
   * -  `0` means the tag is self-closing
   * - `-1` means the tag is closing
   */
  nesting: TokenNesting;
  /**
   * html tag name, e.g. "p"
   */
  tag: string;
  /**
   * Type of the token (string, e.g. "paragraph_open")
   */
  type: string;
}

/**
 * Level change (number in {-1, 0, 1} set), where:
 *
 * -  `1` means the tag is opening
 * -  `0` means the tag is self-closing
 * - `-1` means the tag is closing
 */
export enum TokenNesting {
  Opening = 1,
  SelfClosing = 0,
  Closing = -1
}

/**
 * Instead of traditional AST we use more low-level data representation - *tokens*.
 * The difference is simple:
 *
 * - Tokens are a simple sequence (Array).
 * - Opening and closing tags are separate.
 * - There are special token objects, "inline containers", having nested tokens.
 *   sequences with inline markup (bold, italic, text, ...).
 *
 * See [token class](https://github.com/markdown-it/markdown-it/blob/master/lib/token.js)
 * for details about each token content.
 *
 * In total, a token stream is:
 *
 * - On the top level - array of paired or single "block" tokens:
 *   - open/close for headers, lists, blockquotes, paragraphs, ...
 *   - codes, fenced blocks, horizontal rules, html blocks, inlines containers
 * - Each inline token have a `.children` property with a nested token stream for inline content:
 *   - open/close for strong, em, link, code, ...
 *   - text, line breaks
 *
 * Why not AST? Because it's not needed for our tasks. We follow KISS principle.
 * If you wish - you can call a parser without a renderer and convert the token stream
 * to an AST.
 *  */
export type TokenStream = Token[];
