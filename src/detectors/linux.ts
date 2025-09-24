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

        if (lowerSource.includes('korean') || lowerSource.includes('hangul') || lowerSource.includes('kr') || lowerSource === 'ko') {
            return 'Korean';
        }
        if (lowerSource.includes('english') || lowerSource.includes('us') || lowerSource === 'en') {
            return 'English';
        }
        if (lowerSource.includes('japanese') || lowerSource.includes('jp') || lowerSource === 'ja') {
            return 'Japanese';
        }
        if (lowerSource.includes('chinese') || lowerSource.includes('cn') || lowerSource === 'zh') {
            return 'Chinese';
        }

        return 'English';
    }
}