import {RequestHandler} from "./services/requestHandler";
import {UsersPage} from "./pages/usersPage";
import {MasterPage} from "./pages/masterPage";

$(function() {

    RequestHandler.bootstrap();

    MasterPage.bootstrap();
});
