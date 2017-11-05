export module Pages {

    export interface Page {

        display(): void;
    }

    export async function changePage(handler: () => Promise<HTMLElement>) {

        $("#pageLoadSpinner").show();

        let newPageContent = await handler();
        if (null == newPageContent)
        {
            $("#pageLoadSpinner").hide();
            return;
        }

        var container = document.getElementById('pageContentContainer');
        container.innerHTML = '';
        container.appendChild(newPageContent);

        $("#pageLoadSpinner").hide();
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