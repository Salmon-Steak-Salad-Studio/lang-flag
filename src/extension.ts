import * as vscode from 'vscode';
import { createDetector, InputSourceInfo } from './detector';

let detector = createDetector();
let decorationType: vscode.TextEditorDecorationType;
let currentLanguage: InputSourceInfo['language'] | '' = '';
let pollInterval: NodeJS.Timeout;
let lastCheckTime = 0;

export function activate(context: vscode.ExtensionContext) {
    console.log('Keyboard Language Indicator activated');

    decorationType = vscode.window.createTextEditorDecorationType({
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
    });

    const startPolling = (interval: number) => {
        if (pollInterval) {
            clearInterval(pollInterval);
        }
        pollInterval = setInterval(updateLanguage, interval);
    };

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(() => {
            startPolling(100);

            setTimeout(() => {
                startPolling(500);
            }, 1000);
        })
    );

    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection(() => {
            updateLanguage();
        })
    );

    startPolling(500);
    updateLanguage();
}

async function updateLanguage() {
    const config = vscode.workspace.getConfiguration('keyboardLanguageIndicator');
    if (!config.get('enabled')) {
        return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    try {
        const now = Date.now();
        if (now - lastCheckTime < 50) {
            return;
        }
        lastCheckTime = now;

        const info = await detector.detect();

        if (info.language !== currentLanguage) {
            currentLanguage = info.language;
        }

        const icons: Record<InputSourceInfo['language'], string> = {
            'Korean': '한',
            'English': 'EN',
            'Japanese': '日',
            'Chinese': '中',
            'Unknown': '?'
        };

        const colors: Record<InputSourceInfo['language'], string> = {
            'Korean': '#ff6b6b',
            'English': '#4ecdc4',
            'Japanese': '#ffe66d',
            'Chinese': '#a8dadc',
            'Unknown': '#6c757d'
        };

        const position = editor.selection.active;
        editor.setDecorations(decorationType, [{
            range: new vscode.Range(position, position),
            renderOptions: {
                after: {
                    contentText: `${icons[info.language]}`,
                    backgroundColor: colors[info.language],
                    color: '#ffffff',
                    textDecoration: `none; position: absolute; top: 0; transform: translateY(-100%); padding: 1px; border-radius: 3px; font-weight: bold;`
                }
            }
        }]);
    } catch (error) {
        console.error('Language detection failed:', error);
    }
}

export function deactivate() {
    if (pollInterval) {
        clearInterval(pollInterval);
    }
}