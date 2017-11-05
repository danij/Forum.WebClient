import {HomePage} from "./pages/homePage";
import {RequestHandler} from "./services/requestHandler";

$(function() {

    RequestHandler.bootstrap();

    let page = new HomePage();
    page.display();
});
