export module ConsentRepository {

    let cookieConsentPromiseResolve: any;

    const cookieConsentPromise = new Promise<void>(((resolve, reject) => {

        cookieConsentPromiseResolve = resolve;
    }));

    export function getCookieConsent() : Promise<void> {

        return cookieConsentPromise;
    }

    export function consentToUsingCookies() {

        cookieConsentPromiseResolve();
    }

    export function alreadyConsentedToUsingCookies(): boolean {

        return false;
    }

    if (alreadyConsentedToUsingCookies()) {

        consentToUsingCookies();
    }
}