import {RequestHandler} from "./services/requestHandler";
import {TagsPage} from "./pages/tagsPage";

$(function() {

    RequestHandler.bootstrap();

    let page = new TagsPage();
    page.display();
});
