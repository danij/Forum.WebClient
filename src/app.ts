import {RequestHandler} from "./services/requestHandler";
import {UsersPage} from "./pages/usersPage";

$(function() {

    RequestHandler.bootstrap();

    let page = new UsersPage();
    page.display();
});
