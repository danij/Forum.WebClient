import {RequestHandler} from './requestHandler';
import {RepositoryCommon} from './repositoryCommon';

export module ConsentRepository {

    export async function consentToUsingCookies(): Promise<void> {

        await RequestHandler.post({

            path : '../auth/consent/consent_required_cookies'
        });
        RequestHandler.onConsentedToUsingCookies();
    }

    export async function removeConsentToUsingCookies(): Promise<void> {

        await RequestHandler.requestDelete({

            path : '../auth/consent/consent_required_cookies'
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

    export function hasConsentedToUsingRequiredCookies(): boolean {

        return RepositoryCommon.getCookieValue('allow_cookies_required') === 'yes';
    }

    export function hasConsentedToLoadingExternalContent(): boolean {

        return RepositoryCommon.getCookieValue('allow_external_content') === 'yes';
    }
}