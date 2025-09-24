import * as vscode from 'vscode';
import { InputSourceInfo } from './types';

export class LanguageHoverProvider implements vscode.HoverProvider {
    private currentLanguage: InputSourceInfo['language'] = 'Unknown';

    updateLanguage(language: InputSourceInfo['language']) {
        this.currentLanguage = language;
    }

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        const markdown = new vscode.MarkdownString();
        markdown.appendMarkdown(`**Current Input:** \`${this.currentLanguage}\``);

        return new vscode.Hover(markdown);
    }
}