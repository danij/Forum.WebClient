import {PathHelpers} from "../helpers/pathHelpers";

export module RequestHandler {

    export interface Request {

        path: string;
        extra?: string[];
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
                if (data.startsWith(serviceConfig.responsePrefix)) {
                    data = data.substr(serviceConfig.responsePrefix.length);
                }
                return data;
            }
        });
    }

    function getUrl(request: Request) {

        var extra = request.extra || [];
        return PathHelpers.joinPath(serviceConfig.uri, request.path, ...extra);
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
