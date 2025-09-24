import * as vscode from 'vscode';
import { InputSourceInfo } from './types';

export class LanguageOverlay {
    private panel: vscode.WebviewPanel | undefined;
    private currentLanguage: InputSourceInfo['language'] = 'Unknown';
    private cursorPosition: { line: number; character: number } = { line: 0, character: 0 };

    constructor(private context: vscode.ExtensionContext) {}

    public show() {
        if (this.panel) {
            this.panel.reveal();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'languageOverlay',
            'Language Indicator',
            {
                viewColumn: vscode.ViewColumn.Active,
                preserveFocus: true
            },
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panel.webview.html = this.getHtmlContent();

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }

    public updateLanguage(language: InputSourceInfo['language']) {
        this.currentLanguage = language;
        this.updateWebview();
    }

    public updateCursorPosition(line: number, character: number) {
        this.cursorPosition = { line, character };
        this.updateWebview();
    }

    private updateWebview() {
        if (this.panel) {
            this.panel.webview.postMessage({
                type: 'update',
                language: this.currentLanguage,
                position: this.cursorPosition
            });
        }
    }

    private getHtmlContent(): string {
        const icons: Record<InputSourceInfo['language'], string> = {
            'Korean': '한',
            'English': 'EN',
            'Japanese': '日',
            'Chinese': '中',
            'Unknown': '?'
        };

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                    background: transparent;
                }
                #overlay {
                    position: fixed;
                    pointer-events: none;
                    z-index: 9999;
                    font-family: var(--vscode-editor-font-family);
                    font-size: 12px;
                }
                .indicator {
                    position: absolute;
                    background: var(--vscode-editor-background);
                    color: var(--vscode-editorCodeLens-foreground);
                    border: 1px solid var(--vscode-editorCodeLens-foreground);
                    padding: 2px 6px;
                    border-radius: 3px;
                    white-space: nowrap;
                    transition: all 0.1s ease;
                }
            </style>
        </head>
        <body>
            <div id="overlay">
                <div class="indicator" id="language-indicator">EN</div>
            </div>
            <script>
                const vscode = acquireVsCodeApi();
                const indicator = document.getElementById('language-indicator');

                const icons = ${JSON.stringify(icons)};

                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.type === 'update') {
                        const icon = icons[message.language] || '?';
                        indicator.textContent = icon;

                        // Calculate position based on cursor
                        const lineHeight = 19;
                        const charWidth = 7.2;
                        const top = message.position.line * lineHeight;
                        const left = message.position.character * charWidth;

                        indicator.style.top = top + 'px';
                        indicator.style.left = (left - 30) + 'px';
                    }
                });
            </script>
        </body>
        </html>`;
    }

    public dispose() {
        if (this.panel) {
            this.panel.dispose();
        }
    }
}