export type SupportedLanguage =
    | 'Korean'
    | 'English'
    | 'Japanese'
    | 'Chinese'
    | 'Arabic'
    | 'Russian'
    | 'Thai'
    | 'Vietnamese'
    | 'German'
    | 'French'
    | 'Spanish'
    | 'Portuguese'
    | 'Italian'
    | 'Hindi'
    | 'Bengali'
    | 'Turkish'
    | 'Polish'
    | 'Unknown';

export interface InputSourceInfo {
    source: string;
    language: SupportedLanguage;
    platform: 'mac' | 'windows' | 'linux';
}

export interface LanguageDetector {
    detect(): Promise<InputSourceInfo>;
}