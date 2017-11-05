import {Pages} from './common';
import {CategoryRepository} from "../services/categoryRepository";
import {CategoriesView} from "../views/categoriesView";

/**
 * The home page displays the root categories
 */
export class HomePage implements Pages.Page {

    display(): void {

        $('#HomePageLink').addClass('uk-active');
        Pages.changePage(async () => {

            let categories = await Pages.getOrShowError(CategoryRepository.getRootCategories());
            if (null == categories) return;

            return CategoriesView.createCategoriesTable(categories);
        });
    }
}
