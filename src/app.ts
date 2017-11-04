import {UIkit, Icons} from './externals';
import {HomePage} from "./pages/homePage";

$(function() {

    try {
        UIkit.use(Icons);
    }
    catch(e) {

    }

    let page = new HomePage();
    page.display();
});
