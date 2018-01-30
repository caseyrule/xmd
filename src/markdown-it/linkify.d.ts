/**
 * @constructor
 *
 * Creates new linkifier instance with optional additional schemas.
 *
 * By default understands:
 *
 * - `http(s)://...` , `ftp://...`, `mailto:...` & `//...` links
 * - "fuzzy" links and emails (example.com, foo@bar.com).
 *
 * @param {SchemaRules} schemas - Additional schemas to validate (prefix/validator)
 * @param {Options} options - parsing and rendering options
 */
interface LinkifyItConstructor {
  new (schemas?: SchemaRules, options?: Options): LinkifyIt;
  (schemas?: SchemaRules, options?: Options): LinkifyIt;
}

export declare const LinkifyIt: LinkifyItConstructor;

interface LinkifyIt {
  /**
   * Add new rule definition. See constructor description for details.
   *
   * @param {String} schema - rule name (fixed pattern prefix)
   * @param {String|RegExp|Object} definition - schema definition
   * @return {LinkifyIt} this
   */
  add(schema: string, rule: string | RegExp | SchemaRule): LinkifyIt;
  /**
   * Result match description
   *
   * @param schema - link schema, can be empty for fuzzy links, or `//` for
   *   protocol-neutral  links.
   * @param index - offset of matched text
   * @param lastIndex - index of next char after mathch end
   * @param raw - matched text
   * @param text - normalized text
   * @param url - link, generated from matched text
   * @return array of found link descriptions or `null` on fail. We strongly
   * recommend to use {@link test} first, for best speed.
   */
  match(text: string): Match[];

  /**
   * Default normalizer (if schema does not define it's own).
   */
  normalize(raw: string): string;
  /**
   * Very quick check, that can give false positives. Returns true if link MAY BE
   * can exists. Can be used for speed optimization, when you need to check that
   * link NOT exists.
   */
  pretest(text: string): boolean;
  /**
   * Set recognition options for links without schema.
   *
   * @param {Object} options - { fuzzyLink|fuzzyEmail|fuzzyIP: true|false }
   * @return {LinkifyIt} this
   */
  set(options: Options): LinkifyIt;
  /**
   * Searches linkifiable pattern and returns `true` on success or `false` on fail.
   */
  test(text: string): boolean;
  /**
   * Similar to {@link test} but checks only specific protocol tail exactly
   * at given position. Returns length of found pattern (0 on fail).
   *
   * @param {String} text - text to scan
   * @param {String} name - rule (schema) name
   * @param {Number} position - text offset to check from
   */
  testSchemaAt(text: string, schemaName: string, pos: number): number;
  /**
   * Load (or merge) new tlds list. Those are user for fuzzy links (without prefix)
   * to avoid false positives. By default this algorythm used:
   *
   * - hostname with any 2-letter root zones are ok.
   * - biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф
   *   are ok.
   * - encoded (`xn--...`) root zones are ok.
   *
   * If list is replaced, then exact match for 2-chars root zones will be checked.
   *
   * @param {Array} list - list of tlds
   * @param {Boolean} keepOld - merge with current list if `true` (`false` by default)
   * @return {LinkifyIt} this
   */
  tlds(list: string | string[], keepOld?: boolean): LinkifyIt;
}

/**
 * `schemas` is an object, where each key/value describes protocol/rule:
 *
 * @param key - link prefix (usually, protocol name with `:` at the end, `skype:`
 *   for example). `linkify-it` makes shure that prefix is not preceeded with
 *   alphanumeric char and symbols. Only whitespaces and punctuation allowed.
 * @param value - rule to check tail after link prefix
 *   - _String_ - just alias to existing rule
 *   - _Object_
 *     - _validate_ - validator function (should return matched length on success),
 *       or `RegExp`.
 *     - _normalize_ - optional function to normalize text & url of matched result
 *       (for example, for @twitter mentions).
 *
 */
interface SchemaRules {
  [schema: string]: string | RegExp | SchemaRule;
}

interface SchemaRule {
  validate(text: string, pos: number, self: LinkifyIt): number;
  normalize?(match: string): string;
}

/**
 * @param {boolean} fuzzyLink - recognige URL-s without `http(s):` prefix. Default `true`.
 * @param {boolean} fuzzyIP - allow IPs in fuzzy links above. Can conflict with some texts
 *   like version numbers. Default `false`.
 * @param {boolean} fuzzyEmail - recognize emails without `mailto:` prefix.
 *
 */
interface Options {
  fuzzyLink?: boolean;
  fuzzyIP?: boolean;
  fuzzyEmail?: boolean;
}

/**
 * Match result. Single element of array, returned by [[LinkifyIt#match]]
 */
interface Match {
  index: number;
  lastIndex: number;
  raw: string;
  schema: string;
  text: string;
  url: string;
}
