export module ThemeRepository {

    export function getFavoriteTheme(): string {

        return localStorage.getItem('theme') || '';
    }

    export function saveFavoriteTheme(value: string): void {

        localStorage.setItem('theme', value);
    }
}