import { MarkdownIt } from './index';
import { Token, TokenNesting, TokenStream } from './tokens';
import { RuleChain } from './rules';

interface State<T extends RuleChain> {
  /**
   * The markdown source
   */
  src: string;
  /**
   * An environment sandbox can be used alongside tokens to inject external variables for your parsers and renderers.
   */
  env: object;
  /**
   * The token stream
   */
  tokens: TokenStream;
  /**
   * ff `true`, the source will be parsed by the inline parser;
   * if `false`, the source will be parsed by the block parser
   */
  inlineMode: boolean;
  /**
   * Link to parser instance
   */
  md: MarkdownIt;
}

interface InlineState extends State<'inline'> {
  pos: number;
  posMax: number;
  level: number;
  pending: string;
  pendingLevel: number;
  // Stores { start: end } pairs. Useful for backtrack optimization of pairs parse (emphasis, strikes).
  cache: { [key: number]: number };
  // Emphasis-like delimiter
  delimiters: string[];

  /**
   * @param {string} src - The source text
   * @param {MarkdownIt} md - The markdown parser
   * @param {Environment} env - An environment sandbox can be used alongside tokens to inject
   *    external variables for your parsers and renderers.
   * @param {TokenStream} outTokens - The token stream for pushing new tokens
   */
  new: (src: string, md: MarkdownIt, env: object, outTokens: TokenStream) => InlineState;

  /**
   * Flush pending text
   */
  pushPending: () => Token;

  /**
   * Push new token to "stream".
   * If pending text exists - flush it as text token
   */
  push: (type: string, tag: string, nesting: TokenNesting) => Token;

  /**
   * Scan a sequence of emphasis-like markers, and determine whether
   * it can start an emphasis sequence or end an emphasis sequence.
   *
   * @param start - position to scan from (it should point at a valid marker);
   * @param canSplitWord - determine if these markers can be found inside a word
   */
  scanDelims: (start: number, canSplitWord: boolean) => void;
}

interface BlockState extends State<'block'> {
  bMarks: number[]; // line begin offsets for fast jumps
  eMarks: number[]; // line end offsets for fast jumps
  tShift: number[]; // offsets of the first non-space characters (tabs not expanded)
  sCount: number[]; // indents for each line (tabs expanded)

  // An amount of virtual spaces (tabs expanded) between beginning
  // of each line (bMarks) and real beginning of that line.
  //
  // It exists only as a hack because blockquotes override bMarks
  // losing information in the process.
  //
  // It's used only when expanding tabs, you can think about it as
  // an initial tab length, e.g. bsCount=21 applied to string `\t123`
  // means first tab should be expanded to 4-21%4 === 3 spaces.
  //
  bsCount: number[];

  // block parser variables
  blkIndent: number; // required block content indent
  // (for example, if we are in list)
  line: number; // line index in src
  lineMax: number; // lines count
  tight: false; // loose/tight mode for lists
  ddIndent: number; // indent of the current dd block (-1 if there isn't any)
  // can be 'blockquote', 'list', 'root', 'paragraph' or 'reference'
  // used in lists to determine if they interrupt a paragraph
  parentType: string;
  level: 0;
  // renderer
  result: '';
  new: (src: string, md: MarkdownIt, env: object, outTokens: TokenStream) => BlockState;

  // Push new token to "stream".
  //
  push: (type: string, tag: string, nesting: TokenNesting) => Token;
  isEmpty: (line) => boolean;
  skipEmptyLines: (from: number) => number;
  /**
   * Skip spaces from given position.
   */
  skipSpaces: (pos: number) => number;
  /**
   * Skip spaces from given position in reverse.
   */
  skipSpacesBack: (pos: number, min: number) => number;
  /**
   * Skip char codes from given position
   */
  skipChars: (pos: number, code: string) => number;
  /**
   * Skip char codes reverse from given position - 1
   */
  skipCharsBack: (pos: number, code: string, min: number) => number;
  /**
   * cut lines range from source.
   */
  getLines: (begin: number, end: number, indent: number, keepLastLF: boolean) => string;
}
