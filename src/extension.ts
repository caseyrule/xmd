import {
  Logger,
  VSCExtension,
  getLogger,
  ExtensionContext,
  TextDocument,
  Uri,
  ViewColumn,
  WorkspaceConfiguration,
  vscode
} from 'vscex';

import { MarkdownIt } from './markdown-it';
import { markdownItMath } from './mdx';

export class MarkdownX extends VSCExtension {
  private md: MarkdownIt;

  constructor(context: ExtensionContext) {
    super(context, 'markdown.ext', 'Markdown');
  }

  public renderAsHtml(): void {
    vscode.workspace.openTextDocument({
      language: 'html',
      content: this.md.render(vscode.window.activeTextEditor.document.getText())
    });
  }

  public setParser(md: MarkdownIt): void {
    this.md = md;

    try {
      [
        'markdown-it-abbr',
        'markdown-it-anchor',
        'markdown-it-attrs',
        'markdown-it-container',
        'markdown-it-deflist',
        'markdown-it-footnote',
        'markdown-it-header-sections',
        'markdown-it-sub',
        'markdown-it-sup'
      ].forEach(plugin => {
        const pluginConfig = vscode.workspace.getConfiguration('markdown.' + plugin);

        this.log.trace(`Enabling ${plugin} plugin`);
        md.use(require(plugin), pluginConfig);
      });

      this.log.trace('Enabling TeX math with KaTeX rendering');
      md.use(markdownItMath);
    } catch (e) {
      this.log.error(e);
      vscode.window.showErrorMessage(e.message);
    }
  }

  public static activate(extension: MarkdownX, methods: Array<keyof MarkdownX>): any {
    VSCExtension.registerMethods(extension, methods);

    return {
      extendMarkdownIt: md => {
        extension.setParser(md);
        return md;
      }
    };
  }
}

export function activate(context: vscode.ExtensionContext): void {
  return MarkdownX.activate(new MarkdownX(context), ['renderAsHtml']);
}

export function deactivate(): void {}
