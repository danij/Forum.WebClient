import $ from '../externals';
import {Page} from './common';

/**
 * The home page displays the root categories
 */
export class HomePage implements Page {

    display(): void {

        $('#HomePageLink').addClass('uk-active');
    }
}
