import {PathHelpers} from "../helpers/pathHelpers";

export module RequestHandler {

    export interface Request {

        path: string;
        extra?: string[];
        query?: any;
    }

    export interface GetRequest extends Request {

    }

    interface ServiceConfig {
        uri: string;
        responsePrefix: string;
    }

    declare const serviceConfig: ServiceConfig;

    export function bootstrap() {

        $.ajaxSetup({
            dataFilter: (data, type) => {
                if (type != 'json') {
                    return data;
                }
                if (0 == data.indexOf(serviceConfig.responsePrefix)) {
                    data = data.substr(serviceConfig.responsePrefix.length);
                }
                return data;
            }
        });
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

    export function get(request: GetRequest) {

        return new Promise((resolve, reject) => {
            $.ajax({
                method: 'GET',
                dataType: 'json',
                url: getUrl(request)
            }).done(data => {
                resolve(data);
            }).fail((xhr: JQuery.jqXHR, textStatus: string, extraStatus: string) => {
                reject(new Error(`${textStatus} (${extraStatus})`));
            });
        });
    }

}
