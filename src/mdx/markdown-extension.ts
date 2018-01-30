import { MarkdownIt, RenderRule, Rule, RuleChain, Ruler } from '../markdown-it';
import { Logger } from 'typescript-logging';

export type MarkdownItPlugin = (md: MarkdownIt, ...options: any[]) => void;

export abstract class MarkdownExtension {
  constructor(protected md: MarkdownIt, protected log: Logger) {}

  /**
   * Provide matching and rendering functions for a new token type
   *
   * @template T - the chain type
   * @param {T} chain - the chain type
   * @param {string} name - the token type name
   * @param {Rule<T>} rule - matches this types of token
   * @param {TokenRender} render - renders this type of token
   */
  protected defineToken<T extends RuleChain>(chain: T, name: string, rule: Rule<T>, render: RenderRule): void {
    const extension: MarkdownExtension = this;

    (<Ruler<T>>this.md[chain].ruler).push(name, function(): boolean | void {
      try {
        return rule.apply(extension, arguments);
      } catch (e) {
        this.log.error(`Failed to parse ${name}: `, e);
      }
    });

    this.md.renderer.rules[name] = function(): string | void {
      try {
        this.log.inspect(arguments[1], arguments[0][arguments[1]]);
        return render.apply(extension, arguments);
      } catch (e) {
        this.log.error(`Failed to render ${name}: `, e);
      }
    };
  }
}
