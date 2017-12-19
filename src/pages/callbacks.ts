import {PageActions} from "./action";

export module Callbacks {

    class TagCallback implements PageActions.ITagCallback {

        createRootTag(name: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        deleteTag(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        editTagName(id: string, newName: string): Promise<boolean> {

            return Promise.resolve(true);
        }
    }

    export function getTagCallback() : PageActions.ITagCallback {

        return new TagCallback();
    }
}