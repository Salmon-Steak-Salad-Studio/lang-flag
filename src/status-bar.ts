import * as vscode from 'vscode';
import { InputSourceInfo } from './types';

export class LanguageStatusBar {
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.show();
    }

    updateLanguage(info: InputSourceInfo) {
        const icons: Record<InputSourceInfo['language'], string> = {
            'Korean': '한',
            'English': 'EN',
            'Japanese': '日',
            'Chinese': '中',
            'Unknown': '?'
        };

        this.statusBarItem.text = `$(globe) ${icons[info.language]}`;
        this.statusBarItem.tooltip = `Input: ${info.language} (${info.source})`;
    }

    dispose() {
        this.statusBarItem.dispose();
    }
}