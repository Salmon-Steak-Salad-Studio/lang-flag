import { exec } from 'child_process';
import { promisify } from 'util';
import { InputSourceInfo, LanguageDetector } from '../types';

const execAsync = promisify(exec);

export class MacOSDetector implements LanguageDetector {
    async detect(): Promise<InputSourceInfo> {
        try {
            const { stdout } = await execAsync(
                `defaults read ~/Library/Preferences/com.apple.HIToolbox.plist AppleSelectedInputSources | grep -E '(Input Mode|KeyboardLayout Name)' | head -1 | sed 's/.*= "\\(.*\\)";/\\1/'`
            );
            const source = stdout.trim() || 'ABC';

            return {
                source,
                language: this.parseLanguage(source),
                platform: 'mac'
            };
        } catch (error) {
            console.error('macOS detection failed:', error);
            return {
                source: 'unknown',
                language: 'Unknown',
                platform: 'mac'
            };
        }
    }

    private parseLanguage(source: string): InputSourceInfo['language'] {
        const lowerSource = source.toLowerCase();

        if (lowerSource.includes('korean') || lowerSource.includes('2setkoren') || lowerSource.includes('hangul')) {
            return 'Korean';
        }
        if (lowerSource.includes('english') || lowerSource.includes('abc') || lowerSource.includes('us')) {
            return 'English';
        }
        if (lowerSource.includes('japanese') || lowerSource.includes('hiragana') || lowerSource.includes('katakana')) {
            return 'Japanese';
        }
        if (lowerSource.includes('chinese') || lowerSource.includes('pinyin')) {
            return 'Chinese';
        }

        return 'English';
    }
}