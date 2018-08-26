export module ScrollSpy {

    export function enableScrollSpy(element: HTMLElement, callback: () => void) {

        let previous = {

            height: 0,
            lastVisible: 0
        };

        const interval = setInterval(() => {

            const notVisible = null === element.offsetParent;
            if (notVisible) {

                clearInterval(interval);
                return;
            }

            const current = {

                height: element.offsetHeight,
                lastVisible: element.scrollHeight - element.scrollTop
            };

            if ((current.height == previous.height) && (current.lastVisible == previous.lastVisible)) return;

            previous = current;

            if (current.height == current.lastVisible) {

                callback();
            }

        }, 200);
    }
}