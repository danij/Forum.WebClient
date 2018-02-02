import * as jQuery from 'jquery';
import * as UIkit from 'uikit';
import * as UIkitIcons from 'uikit/dist/js/uikit-icons';
import 'es6-promise';
import * as Remarkable from 'remarkable';
import 'katex';
import * as renderMathInElement from 'katex/dist/contrib/auto-render';

(<any>window).jQuery = jQuery;
(<any>window).UIkit = UIkit;
(<any>window).Remarkable = Remarkable;
(<any>window).renderMathInElement = renderMathInElement;

UIkit.use(UIkitIcons);
