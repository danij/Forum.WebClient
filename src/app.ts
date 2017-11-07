import {RequestHandler} from "./services/requestHandler";
import {ThreadsPage} from "./pages/threadsPage";

$(function() {

    RequestHandler.bootstrap();

    let page = new ThreadsPage();
    page.display();
});
