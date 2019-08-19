export module LanguageRepository {

    export function getLanguage(): string {

        return localStorage.getItem('language') || 'en';
    }

    export function saveLanguage(value: string): void {

        localStorage.setItem('language', value);
    }
}