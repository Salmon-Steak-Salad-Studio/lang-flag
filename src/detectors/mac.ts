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

        if (lowerSource.includes('korean') || lowerSource.includes('2setkoren') || lowerSource.includes('hangul')) return 'Korean';
        if (lowerSource.includes('english') || lowerSource.includes('abc') || lowerSource.includes('us')) return 'English';
        if (lowerSource.includes('japanese') || lowerSource.includes('hiragana') || lowerSource.includes('katakana')) return 'Japanese';
        if (lowerSource.includes('chinese') || lowerSource.includes('pinyin') || lowerSource.includes('simplified') || lowerSource.includes('traditional')) return 'Chinese';
        if (lowerSource.includes('arabic')) return 'Arabic';
        if (lowerSource.includes('russian') || lowerSource.includes('cyrillic')) return 'Russian';
        if (lowerSource.includes('thai')) return 'Thai';
        if (lowerSource.includes('vietnamese') || lowerSource.includes('viet')) return 'Vietnamese';
        if (lowerSource.includes('german') || lowerSource.includes('deutsch')) return 'German';
        if (lowerSource.includes('french') || lowerSource.includes('français')) return 'French';
        if (lowerSource.includes('spanish') || lowerSource.includes('español')) return 'Spanish';
        if (lowerSource.includes('portuguese') || lowerSource.includes('português')) return 'Portuguese';
        if (lowerSource.includes('italian') || lowerSource.includes('italiano')) return 'Italian';
        if (lowerSource.includes('hindi') || lowerSource.includes('devanagari')) return 'Hindi';
        if (lowerSource.includes('bengali') || lowerSource.includes('bangla')) return 'Bengali';
        if (lowerSource.includes('turkish') || lowerSource.includes('türk')) return 'Turkish';
        if (lowerSource.includes('polish') || lowerSource.includes('polski')) return 'Polish';

        return 'English';
    }
}