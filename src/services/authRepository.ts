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

    export async function registerCustomAuth(email: string, password: string, acceptPrivacy: boolean, acceptTos: boolean,
                                             minAge: number): Promise<boolean> {

        //throws exception if there is an issue
        await RequestHandler.post({

            path: '../auth/custom/register',
            objectData: {
                email: email,
                password: password,
                acceptPrivacy: acceptPrivacy,
                acceptTos: acceptTos,
                minAge: minAge
            }
        });
        return true;
    }

    export async function loginCustomAuth(email: string, password: string, acceptPrivacy: boolean, acceptTos: boolean,
                                          showInOnlineUsers: boolean): Promise<boolean> {

        //throws exception if there is an issue
        await RequestHandler.post({

            path: '../auth/custom/login',
            objectData: {
                email: email,
                password: password,
                acceptPrivacy: acceptPrivacy,
                acceptTos: acceptTos,
                showInOnlineUsers: showInOnlineUsers
            }
        });
        return true;
    }
}