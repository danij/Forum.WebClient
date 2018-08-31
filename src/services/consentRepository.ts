import {RequestHandler} from './requestHandler';
import {RepositoryCommon} from './repositoryCommon';

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

    export async function consentToLoadingExternalImages(): Promise<void> {

        await RequestHandler.post({

            path : '../auth/consent/consent_external_images'
        });
    }

    export async function removeConsentToLoadingExternalImages(): Promise<void> {

        await RequestHandler.requestDelete({

            path : '../auth/consent/consent_external_images'
        });
    }

    export function hasConsentedToUsingCookies(): boolean {

        return RepositoryCommon.getCookieValue('allow_cookies_fp') === 'yes';
    }

    export function hasConsentedToLoadingExternalImages(): boolean {

        return RepositoryCommon.getCookieValue('allow_external_images') === 'yes';
    }
}