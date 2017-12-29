import {PathHelpers} from "../helpers/pathHelpers";

export module RequestHandler {

    export interface Request {

        path: string;
        extra?: string[];
        query?: any;
        type?: string;
        stringData?: string;
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
        'User with same auth already exists'
    ];

    function getStatusCode(statusCode: number): string {

        if (statusCode >= 0 && statusCode < StatusCodes.length) {

            return StatusCodes[statusCode];
        }
        return 'Unknown';
    }

    function ajax(method: string, request: Request): Promise<any> {

        return new Promise((resolve, reject) => {

            let xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = () => {

                if (xmlHttp.readyState == XMLHttpRequest.DONE) {

                    let content = parseContent(xmlHttp.responseText);

                    if (content.status) {

                        reject(new Error(getStatusCode(content.status)));
                    }

                    if (xmlHttp.status != 200) {

                        reject(new Error(xmlHttp.statusText));
                    }
                    resolve(content);
                }
            };

            xmlHttp.open(method, getUrl(request));
            xmlHttp.setRequestHeader('Content-Type', request.type ? request.type : 'application/json');
            if (request.stringData && request.stringData.length) {

                xmlHttp.send(request.stringData);
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
        return JSON.parse(responseText.substr(serviceConfig.responsePrefix.length));
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
