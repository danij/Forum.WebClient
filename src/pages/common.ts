import {Views} from "../views/common";

export module Pages {

    export interface Page {

        display(): void;
    }

    export function changePage(handler: () => Promise<HTMLElement>) {

        return Views.changeContent(document.getElementById('pageContentContainer'), handler);
    }

    declare var UIkit: any;

    export async function getOrShowError<T>(promise: Promise<T>): Promise<T> {

        try {
            return await promise;
        }
        catch (e) {

            UIkit.notification({
                message: 'An error has occurred: ' + e.message,
                status: 'primary',
                timeout: 3000
            });
            return null;
        }
    }
}