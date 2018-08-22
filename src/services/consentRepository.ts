import {RequestHandler} from "./requestHandler";

export module ConsentRepository {

    export async function consentToUsingCookies(): Promise<void> {

        await RequestHandler.post({

            path : '../auth/consent/consent_fp_cookies'
        });
        RequestHandler.onConsentedToUsingCookies();
    }

    export async function removeConsentToUsingCookies(): Promise<void> {

        await RequestHandler.requestDelete({

            path : '../auth/consent/consent_fp_cookies'
        });
    }

    function getCookieValue(name: string): string {

        const nameValuePairs = document.cookie
            .split(';')
            .map(p => p.trim().split('='));

        for (let nameValuePair of nameValuePairs) {

            if (nameValuePair[0] == name) {

                return nameValuePair[1];
            }
        }
    }

    export function alreadyConsentedToUsingCookies(): boolean {

        return getCookieValue('allow_cookies_fp') === 'yes';
    }
}