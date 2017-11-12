import {Pages} from './common';
import {CategoryRepository} from "../services/categoryRepository";
import {CategoriesView} from "../views/categoriesView";
import {MasterPage} from "./masterPage";

/**
 * The home page displays the root categories
 */
export class HomePage implements Pages.Page {

    display(): void {

        MasterPage.goTo('home', 'Home');

        document.getElementById('HomePageLink').classList.add('uk-active');

        Pages.changePage(async () => {

            let categories = await Pages.getOrShowError(CategoryRepository.getRootCategories());
            if (null == categories) return;

            return CategoriesView.createCategoriesTable(categories);
        });
    }

    static loadPage(url: string) : boolean {

        if (('/' != url) && (url.indexOf('home/') != 0)) return false;

        new HomePage().display();

        return true;
    }
}
