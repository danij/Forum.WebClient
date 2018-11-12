import {PathHelpers} from '../helpers/pathHelpers';
import {ConsentRepository} from './consentRepository';
import {RepositoryCache} from './repositoryCache';

export module RequestHandler {

    export interface Request {

        path: string;
        extra?: string[];
        extraHeaders?: {};
        query?: any;
        type?: string;
        objectData?: any;
        stringData?: string;
        binaryData?: ArrayBuffer;
        doNotParse?: boolean;
        cacheSeconds?: number;
        allowEmptyContent?: boolean;
    }

    interface ServiceConfig {
        uri: string;
        responsePrefix: string;
    }

    declare const serviceConfig: ServiceConfig;

    export function bootstrap() {

        //do nothing
    }

    function getUrl(request: Request) {

        const extra = request.extra || [];
        const path = PathHelpers.joinPath(serviceConfig.uri, request.path, ...extra);

        const query = Object.keys(request.query || {})
            .filter(key => request.query.hasOwnProperty(key))
            .map(key => `${key}=${request.query[key]}`)
            .join("&");

        return query.length > 0 ? path + '?' + query : path;
    }

    const StatusCodes: string[] = [

        'Ok',
        'Invalid parameters',
        'Value too long',
        'Value too short',
        'Already exists',
        'Not found',
        'No effect',
        'Circular reference not allowed',
        'Not allowed',
        'Not updated since last check',
        'Unauthorized',
        'Throttled',
        'User with same auth already exists',
        'Quota exceeded'
    ];

    function getStatusCode(statusCode: number): string {

        if (statusCode >= 0 && statusCode < StatusCodes.length) {

            return StatusCodes[statusCode];
        }
        return 'Unknown';
    }

    let getDoubleSubmitCookiePromise: Promise<string>;

    export function getDoubleSubmitHeaderName(): string {

        return 'X-Double-Submit';
    }

    export async function getDoubleSubmitCookie(): Promise<string> {

        if ( ! ConsentRepository.hasConsentedToUsingRequiredCookies()) {

            return '';
        }

        if ( ! getDoubleSubmitCookiePromise) {

            getDoubleSubmitCookiePromise = loadDoubleSubmitCookie();
        }

        return await getDoubleSubmitCookiePromise;
    }

    async function loadDoubleSubmitCookie() : Promise<string> {

        let result = await ajaxSimple('GET', {

            path: '../auth/double_submit_cookie'
        });

        return result.double_submit;
    }

    export function onConsentedToUsingCookies() {

        getDoubleSubmitCookiePromise = null;
        getDoubleSubmitCookie();
    }

    async function ajax(method: string, request: Request) : Promise<any> {

        const doubleSubmitCookie = await getDoubleSubmitCookie();

        if (doubleSubmitCookie) {

            request.extraHeaders = request.extraHeaders || {};
            request.extraHeaders['X-Double-Submit'] = doubleSubmitCookie;
        }
        return await ajaxSimple(method, request);
    }

    function ajaxSimple(method: string, request: Request): Promise<any> {

        const url = getUrl(request);

        if (request.cacheSeconds) {

            const fromCache = RepositoryCache.get(url);
            if (fromCache) {

                return Promise.resolve(fromCache);
            }
        }

        return new Promise((resolve, reject) => {

            const xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = () => {

                if (xmlHttp.readyState == XMLHttpRequest.DONE) {

                    if (xmlHttp.status != 200) {

                        reject(new Error(xmlHttp.statusText));
                    }

                    const content = request.doNotParse
                        ? xmlHttp.responseText
                        : parseContent(xmlHttp.responseText);

                    if (( ! request.allowEmptyContent) && (null == content)) {

                        reject(new Error("No content received"));
                    }
                    else if (content.status) {

                        const statusText = content.statusText || getStatusCode(content.status);
                        reject(new Error(statusText));
                    }

                    if (request.cacheSeconds) {

                        RepositoryCache.update(url, content, request.cacheSeconds);
                    }

                    resolve(content);
                }
            };

            xmlHttp.open(method, url);
            xmlHttp.setRequestHeader('Content-Type', request.type ? request.type : 'application/json');

            if (request.extraHeaders) {

                for (let ownPropertyName of Object.getOwnPropertyNames(request.extraHeaders)) {

                    xmlHttp.setRequestHeader(ownPropertyName, request.extraHeaders[ownPropertyName]);
                }
            }

            if (request.objectData) {

                xmlHttp.send(JSON.stringify(request.objectData));
            }
            else if (request.stringData) {

                xmlHttp.send(request.stringData);
            }
            else if (request.binaryData) {

                xmlHttp.send(request.binaryData);
            }
            else {

                xmlHttp.send();
            }
        });
    }

    function parseContent(responseText: string): any {

        if ((null == responseText) || ! responseText.startsWith(serviceConfig.responsePrefix)) {

            return null;
        }
        responseText = responseText.substr(serviceConfig.responsePrefix.length);

        return responseText.length ? JSON.parse(responseText) : {};
    }

    export function parseContentAs<T>(xmlHttp: XMLHttpRequest): T {

        const content = parseContent(xmlHttp.responseText);

        if (null == content) {

            throw new Error("No content received");
        }
        else if (content.status) {

            const statusText = content.statusText || getStatusCode(content.status);
            throw new Error(statusText);
        }

        return content as T;
    }

    export function get(request: Request): Promise<any> {

        return ajax('GET', request);
    }

    export function post(request: Request): Promise<any> {

        return ajax('POST', request);
    }

    export function put(request: Request): Promise<any> {

        return ajax('PUT', request);
    }

    export function requestDelete(request: Request): Promise<any> {

        return ajax('DELETE', request);
    }
}
