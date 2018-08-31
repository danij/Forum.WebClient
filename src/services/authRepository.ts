import {RequestHandler} from './requestHandler';
import {RepositoryCommon} from './repositoryCommon';

export module AuthRepository {

    export function logout() : Promise<void> {

        return RequestHandler.post({

            path: '../auth/logout',
            allowEmptyContent: true,
            doNotParse: true
        });
    }

    export function usingCustomAuthentication(): boolean {

        return RepositoryCommon.getCookieValue('auth_provider') === 'custom';
    }
}