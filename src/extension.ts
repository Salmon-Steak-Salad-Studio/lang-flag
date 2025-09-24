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
            updateLanguage();
            startPolling(100);

            setTimeout(() => {
                startPolling(500);
            }, 1000);
        })
    );

    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection(() => {
            updateDecorationPosition();
            updateLanguage();
        })
    );

    startPolling(500);
    updateLanguage();
}

function updateDecorationPosition() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !currentLanguage) {
        return;
    }

    const icons: Record<InputSourceInfo['language'], string> = {
        'Korean': '한',
        'English': 'EN',
        'Japanese': '日',
        'Chinese': '中',
        'Arabic': 'ع',
        'Russian': 'Ру',
        'Thai': 'ไท',
        'Vietnamese': 'Vi',
        'German': 'De',
        'French': 'Fr',
        'Spanish': 'Es',
        'Portuguese': 'Pt',
        'Italian': 'It',
        'Hindi': 'हि',
        'Bengali': 'বা',
        'Turkish': 'Tr',
        'Polish': 'Pl',
        'Unknown': '?'
    };

    const colors: Record<InputSourceInfo['language'], string> = {
        'Korean': '#ff6b6ba0',
        'English': '#4ecdc4a0',
        'Japanese': '#ffe66da0',
        'Chinese': '#a8dadca0',
        'Arabic': '#e76f51a0',
        'Russian': '#2a9d8fa0',
        'Thai': '#e9c46aa0',
        'Vietnamese': '#f4a261a0',
        'German': '#264653a0',
        'French': '#287271a0',
        'Spanish': '#f07167a0',
        'Portuguese': '#00afb9a0',
        'Italian': '#fed9b7a0',
        'Hindi': '#ff9f1ca0',
        'Bengali': '#06ffa5a0',
        'Turkish': '#ef476fa0',
        'Polish': '#118ab2a0',
        'Unknown': '#6c757da0'
    };

    const position = editor.selection.active;
    editor.setDecorations(decorationType, [{
        range: new vscode.Range(position, position),
        renderOptions: {
            before: {
                contentText: `${icons[currentLanguage]}`,
                backgroundColor: colors[currentLanguage],
                color: '#ffffff',
                textDecoration: `none; position: absolute; top: 0; transform: translateY(-100%); border-radius: 1px; font-weight: bold; font-size: 9px; line-height: 1; padding: 1px 3px;`
            }
        }
    }]);
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
            updateDecorationPosition();
        }
    } catch (error) {
        console.error('Language detection failed:', error);
    }
}

export function deactivate() {
    if (pollInterval) {
        clearInterval(pollInterval);
    }
}