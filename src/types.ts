export interface InputSourceInfo {
    source: string;
    language: 'Korean' | 'English' | 'Japanese' | 'Chinese' | 'Unknown';
    platform: 'mac' | 'windows' | 'linux';
}

export interface LanguageDetector {
    detect(): Promise<InputSourceInfo>;
}