import { exec } from 'child_process';
import { promisify } from 'util';
import { InputSourceInfo, LanguageDetector } from '../types';

const execAsync = promisify(exec);

export class WindowsDetector implements LanguageDetector {
    async detect(): Promise<InputSourceInfo> {
        try {
            const script = `
                Add-Type @"
                using System;
                using System.Runtime.InteropServices;
                public class InputLanguage {
                    [DllImport("user32.dll")]
                    public static extern IntPtr GetForegroundWindow();

                    [DllImport("user32.dll")]
                    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

                    [DllImport("user32.dll")]
                    public static extern IntPtr GetKeyboardLayout(uint idThread);

                    public static string GetCurrentInputLanguage() {
                        IntPtr hwnd = GetForegroundWindow();
                        uint processId;
                        uint threadId = GetWindowThreadProcessId(hwnd, out processId);
                        IntPtr layout = GetKeyboardLayout(threadId);
                        int langId = (int)layout & 0xFFFF;
                        return langId.ToString("X4");
                    }
                }
"@
                [InputLanguage]::GetCurrentInputLanguage()
            `;

            const { stdout } = await execAsync(`powershell -command "${script.replace(/"/g, '\\"')}"`);
            const langCode = stdout.trim();

            const langMap: Record<string, InputSourceInfo['language']> = {
                '0409': 'English', '0809': 'English', '0C09': 'English',
                '0412': 'Korean',
                '0411': 'Japanese',
                '0804': 'Chinese', '0404': 'Chinese', '0C04': 'Chinese',
                '0401': 'Arabic', '0801': 'Arabic',
                '0419': 'Russian',
                '041E': 'Thai',
                '042A': 'Vietnamese',
                '0407': 'German', '0807': 'German',
                '040C': 'French', '080C': 'French',
                '040A': 'Spanish', '080A': 'Spanish',
                '0416': 'Portuguese', '0816': 'Portuguese',
                '0410': 'Italian',
                '0439': 'Hindi',
                '0445': 'Bengali',
                '041F': 'Turkish',
                '0415': 'Polish',
            };

            return {
                source: langCode,
                language: langMap[langCode] || 'Unknown',
                platform: 'windows'
            };
        } catch (error) {
            console.error('Windows detection failed:', error);
            return {
                source: 'unknown',
                language: 'Unknown',
                platform: 'windows'
            };
        }
    }
}