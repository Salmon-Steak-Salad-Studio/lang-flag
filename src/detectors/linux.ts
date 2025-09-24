import { exec } from 'child_process';
import { promisify } from 'util';
import { InputSourceInfo, LanguageDetector } from '../types';

const execAsync = promisify(exec);

export class LinuxDetector implements LanguageDetector {
    async detect(): Promise<InputSourceInfo> {
        try {
            const { stdout } = await execAsync('ibus engine');
            const source = stdout.trim();

            return {
                source,
                language: this.parseLanguage(source),
                platform: 'linux'
            };
        } catch {
            try {
                const { stdout } = await execAsync('fcitx-remote -n');
                const source = stdout.trim();

                return {
                    source,
                    language: this.parseLanguage(source),
                    platform: 'linux'
                };
            } catch (error) {
                console.error('Linux detection failed:', error);
                return {
                    source: 'unknown',
                    language: 'Unknown',
                    platform: 'linux'
                };
            }
        }
    }

    private parseLanguage(source: string): InputSourceInfo['language'] {
        const lowerSource = source.toLowerCase();

        if (lowerSource.includes('korean') || lowerSource.includes('hangul') || lowerSource.includes('kr') || lowerSource === 'ko') return 'Korean';
        if (lowerSource.includes('english') || lowerSource.includes('us') || lowerSource === 'en') return 'English';
        if (lowerSource.includes('japanese') || lowerSource.includes('jp') || lowerSource === 'ja') return 'Japanese';
        if (lowerSource.includes('chinese') || lowerSource.includes('cn') || lowerSource === 'zh') return 'Chinese';
        if (lowerSource.includes('arabic') || lowerSource === 'ar') return 'Arabic';
        if (lowerSource.includes('russian') || lowerSource === 'ru') return 'Russian';
        if (lowerSource.includes('thai') || lowerSource === 'th') return 'Thai';
        if (lowerSource.includes('vietnamese') || lowerSource === 'vi') return 'Vietnamese';
        if (lowerSource.includes('german') || lowerSource === 'de') return 'German';
        if (lowerSource.includes('french') || lowerSource === 'fr') return 'French';
        if (lowerSource.includes('spanish') || lowerSource === 'es') return 'Spanish';
        if (lowerSource.includes('portuguese') || lowerSource === 'pt') return 'Portuguese';
        if (lowerSource.includes('italian') || lowerSource === 'it') return 'Italian';
        if (lowerSource.includes('hindi') || lowerSource === 'hi') return 'Hindi';
        if (lowerSource.includes('bengali') || lowerSource === 'bn') return 'Bengali';
        if (lowerSource.includes('turkish') || lowerSource === 'tr') return 'Turkish';
        if (lowerSource.includes('polish') || lowerSource === 'pl') return 'Polish';

        return 'English';
    }
}