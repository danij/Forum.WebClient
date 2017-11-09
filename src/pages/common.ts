export module Pages {

    export interface Page {

        display(): void;
    }

    export async function changeContent(container: HTMLElement, handler: () => Promise<HTMLElement>) {

        $("#pageLoadSpinner").show();

        let spinner = $('<div class="spinnerElement"><div uk-spinner></div></div>');
        try
        {
            container.appendChild(spinner[0]);

            let newPageContent = await handler();
            if (null == newPageContent)
            {
                return;
            }

            container.innerHTML = '';
            container.appendChild(newPageContent);
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