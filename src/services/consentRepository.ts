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

    export async function consentToLoadingExternalContent(): Promise<void> {

        await RequestHandler.post({

            path : '../auth/consent/consent_external_content'
        });
    }

    export async function removeConsentToLoadingExternalContent(): Promise<void> {

        await RequestHandler.requestDelete({

            path : '../auth/consent/consent_external_content'
        });
    }

    export function hasConsentedToUsingCookies(): boolean {

        return RepositoryCommon.getCookieValue('allow_cookies_fp') === 'yes';
    }

    export function hasConsentedToLoadingExternalContent(): boolean {

        return RepositoryCommon.getCookieValue('allow_external_content') === 'yes';
    }
}