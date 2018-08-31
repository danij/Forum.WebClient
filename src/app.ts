import {RequestHandler} from './services/requestHandler';
import {MasterPage} from './pages/masterPage';

window.addEventListener('load', () => {

    RequestHandler.bootstrap();

    MasterPage.bootstrap();
});
