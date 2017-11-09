export module Pages {

    export interface Page {

        display(): void;
    }

    export async function changeContent(containerElement: HTMLElement, handler: () => Promise<HTMLElement>) {

        let spinner = $('<div class="spinnerElement"><div uk-spinner></div></div>');
        let container = $(containerElement);
        let disabledElement = $('<div class="disabledElement"></div>');

        try
        {
            container.append(disabledElement);
            container.append(spinner);
            spinner.show();

            let newPageContent = await handler();
            if (null == newPageContent)
            {
                disabledElement.remove();
                return;
            }

            container.empty();
            container.append(newPageContent);
        }
        finally
        {
            spinner.remove();
        }
    }

    export function changePage(handler: () => Promise<HTMLElement>) {

        changeContent(document.getElementById('pageContentContainer'), handler);
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