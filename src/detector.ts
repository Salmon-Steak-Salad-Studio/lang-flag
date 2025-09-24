import { LanguageDetector, InputSourceInfo } from './types';
import { MacOSDetector } from './detectors/mac';
import { WindowsDetector } from './detectors/windows';
import { LinuxDetector } from './detectors/linux';

export { InputSourceInfo, LanguageDetector };

export function createDetector(): LanguageDetector {
    switch (process.platform) {
        case 'darwin':
            return new MacOSDetector();
        case 'win32':
            return new WindowsDetector();
        case 'linux':
            return new LinuxDetector();
        default:
            throw new Error(`Unsupported platform: ${process.platform}`);
    }
}