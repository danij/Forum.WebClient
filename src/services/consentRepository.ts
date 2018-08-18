export module ConsentRepository {

    const consentedCookieStorageKey = 'consented-cookies';
    let cookieConsentPromiseResolve: any;

    const cookieConsentPromise = new Promise<void>(((resolve, reject) => {

        cookieConsentPromiseResolve = resolve;
    }));

    export function getCookieConsent() : Promise<void> {

        return cookieConsentPromise;
    }

    export function consentToUsingCookies() {

        localStorage.setItem(consentedCookieStorageKey, 'true');
        cookieConsentPromiseResolve();
    }

    export function alreadyConsentedToUsingCookies(): boolean {

        return localStorage.getItem(consentedCookieStorageKey) == 'true';
    }

    if (alreadyConsentedToUsingCookies()) {

        consentToUsingCookies();
    }
}