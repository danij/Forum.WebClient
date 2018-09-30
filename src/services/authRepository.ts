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
                                             minAge: number, notARobotResponse: string): Promise<boolean> {

        //throws exception if there is an issue
        await RequestHandler.post({

            path: '../auth/custom/register',
            objectData: {
                email: email,
                password: password,
                acceptPrivacy: acceptPrivacy,
                acceptTos: acceptTos,
                minAge: minAge,
                notARobotResponse: notARobotResponse
            }
        });
        return true;
    }

    export async function loginCustomAuth(email: string, password: string, acceptPrivacy: boolean, acceptTos: boolean,
                                          showInOnlineUsers: boolean, notARobotResponse: string): Promise<boolean> {

        //throws exception if there is an issue
        await RequestHandler.post({

            path: '../auth/custom/login',
            objectData: {
                email: email,
                password: password,
                acceptPrivacy: acceptPrivacy,
                acceptTos: acceptTos,
                showInOnlineUsers: showInOnlineUsers,
                notARobotResponse: notARobotResponse
            }
        });
        return true;
    }

    export async function changeCustomPassword(email: string, oldPassword: string, newPassword: string,
                                               notARobotResponse: string): Promise<boolean> {

        //throws exception if there is an issue
        await RequestHandler.post({

            path: '../auth/custom/change_password',
            objectData: {
                email: email,
                oldPassword: oldPassword,
                newPassword: newPassword,
                notARobotResponse: notARobotResponse
            }
        });
        return true;
    }

    export async function resetCustomPassword(email: string, acceptPrivacy: boolean, acceptTos: boolean,
                                              notARobotResponse: string): Promise<boolean> {

        //throws exception if there is an issue
        await RequestHandler.post({

            path: '../auth/custom/reset_password',
            objectData: {
                email: email,
                acceptPrivacy: acceptPrivacy,
                acceptTos: acceptTos,
                notARobotResponse: notARobotResponse
            }
        });
        return true;
    }
}