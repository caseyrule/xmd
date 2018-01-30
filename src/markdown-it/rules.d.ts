import { MarkdownIt, Renderer } from './index';
import { State, BlockState, InlineState } from './states';
import { Token, TokenStream } from './tokens';

export type RuleChain = 'core' | 'block' | 'inline';

export type Rule<T extends RuleChain> = (state: State<T>) => boolean | void;

export interface BlockRule extends Rule<'block'> {
  (state: BlockState, startLine?: number, endLine?: number, silent?: boolean): boolean | void;
}

export interface InlineRule extends Rule<'inline'> {
  (state: InlineState, silent?: boolean): boolean | void;
}

export interface RuleOptions {
  /**
   * array with names of "alternate" chains.
   *
   * @type {string[]}
   */
  alt?: string[];
  [key: string]: any;
}

/**
 * Helper class, used by {@link MarkdownIt#core}, {@link MarkdownIt#block} and
 * {@link MarkdownIt#inline} to manage sequences of functions (rules):
 *
 * - keep rules in defined order
 * - assign the name to each rule
 * - enable/disable rules
 * - add/replace rules
 * - allow assign rules to additional named chains (in the same)
 * - cacheing lists of active rules
 *
 * You will not need use this class directly until write plugins. For simple
 * rules control use {@link MarkdownIt.disable}, {@link MarkdownIt.enable} and
 * {@link MarkdownIt.use}.
 */
export interface Ruler<T extends RuleChain> {
  /**
   * @constructor
   */
  new: () => Ruler<T>;
  /**
   * Add new rule to chain after the one with given name.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.inline.ruler.after('text', 'my_rule', function replace(state) {
   *   //...
   * });
   * ```
   *
   *
   * @param {string} afterName - new rule will be added after this one.
   * @param {string} ruleName - name of added rule.
   * @param {Rule<T>} rule - rule function.
   * @param {any} options - rule options (not mandatory).
   * @see {@link before}
   * @see {@link push}
   */
  after(afterName: string, ruleName: string, rule: Rule<T>, options?: RuleOptions): void;
  /**
   *
   * Replace rule by name with new function & options. Throws error if name not
   * found.
   *
   * ##### Example
   *
   * Replace existing typorgapher replacement rule with new one:
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.core.ruler.at('replacements', function replace(state) {
   *   //...
   * });
   * ```
   *
   * @param {String} name - rule name to replace.
   * @param {Function} fn - new rule function.
   * @param {Object} options - new rule options (not mandatory).
   */
  at(name: string, rule: Rule<T>, options?: RuleOptions): void;
  /**
   *
   * Add new rule to chain before the one with given name.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.block.ruler.before('paragraph', 'my_rule', function replace(state) {
   *   //...
   * });
   * ```
   *
   * @param {String} beforeName - new rule will be added before this one.
   * @param {String} ruleName - name of added rule.
   * @param {Function} fn - rule function.
   * @param {Object} options - rule options (not mandatory).
   * @see {@link after}
   * @see {@link push}
   */
  before(beforeName: string, ruleName: string, rule: Rule<T>, options?: RuleOptions): void;
  /**
   * Disable rules with given names. If any rule name not found - throw Error.
   * Errors can be disabled by second param.
   *
   * @param {string | string[]} list - list of rule names to disable.
   * @param {Boolean} ignoreInvalid - set `true` to ignore errors when rule not found.
   * @return list of found rule names (if no exception happened).
   * @see {@link enable}
   * @see {@link enableOnly}
   */
  disable(rules: string | string[], ignoreInvalid?: boolean): string[];
  /**
   * Enable rules with given names. If any rule name not found - throw Error.
   * Errors can be disabled by second param.
   *
   * @param {string | string[]} list - list of rule names to enable.
   * @param {Boolean} ignoreInvalid - set `true` to ignore errors when rule not found.
   * @return list of found rule names (if no exception happened).
   * @see {@link enableOnly}
   * @see {@link disable}
   */
  enable(rules: string | string[], ignoreInvalid?: boolean): string[];
  /**
   * Enable rules with given names, and disable everything else. If any rule name
   * not found - throw Error. Errors can be disabled by second param.
   *
   * @param {string | string[]} list - list of rule names to enable (whitelist).
   * @param {Boolean} ignoreInvalid - set `true` to ignore errors when rule not found.
   * @see {@link enable}
   * @see {@link disable}
   */
  enableOnly(rule: string, ignoreInvalid?: boolean): void;
  /**
   * Gets the list of active rules for the given chain name. It analyzes
   * rules configuration, compiles caches if not exists and returns result.
   *
   * Default chain name is `''` (empty string). It can't be skipped. That's
   * done intentionally, to keep signature monomorphic for high speed.
   *
   * @return array of active functions (rules) for given chain name.
   */
  getRules(chain: string): Rule<T>[];
  /**
   *
   * Push new rule to the end of chain.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.core.ruler.push('my_rule', function replace(state) {
   *   //...
   * });
   * ```
   *
   * @param {String} ruleName - name of added rule.
   * @param {Function} fn - rule function.
   * @param {Object} options - rule options (not mandatory).
   * @see {@link after}
   * @see {@link before}
   */
  push(ruleName: string, rule: Rule<T>, options?: RuleOptions): void;
}

export type BlockRuler = Ruler<'block'>;
export type InlineRuler = Ruler<'inline'>;

export type RenderRule = (
  tokens: TokenStream,
  index: number,
  options: any,
  env: object,
  renderer: Renderer
) => string | void;
