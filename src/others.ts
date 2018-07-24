import * as jQuery from 'jquery';
import * as UIkit from 'uikit';
import * as UIkitIcons from 'uikit/dist/js/uikit-icons';
import 'es6-promise/auto';
import * as Remarkable from 'remarkable';
import 'katex';
import * as renderMathInElement from 'katex/dist/contrib/auto-render';

import 'highlight.js/styles/default.css';
import 'katex/dist/katex.min.css';
import '../css/main.less';

(<any>window).jQuery = jQuery;
(<any>window).UIkit = UIkit;
(<any>window).Remarkable = Remarkable;
(<any>window).renderMathInElement = renderMathInElement;

UIkit.use(UIkitIcons);

//various polyfills
if ( ! String.prototype.startsWith) {

    String.prototype.startsWith = function(search) {

        return this.indexOf(search) === 0;
    };
}

if ( ! String.prototype.endsWith) {

    String.prototype.endsWith = function(search) {

        return this.substring(this.length - search.length, this.length) === search;
    };
}
