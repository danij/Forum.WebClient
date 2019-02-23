import * as UIkit from 'uikit';
import * as UIkitIcons from 'uikit/dist/js/uikit-icons';
import 'es6-promise/auto';
import * as Remarkable from 'remarkable';
import 'katex';
import * as renderMathInElement from 'katex/dist/contrib/auto-render';
import '@webcomponents/template';
import * as hljs from 'highlight.js/lib/index.js';

(<any>window).UIkit = UIkit;
(<any>window).Remarkable = Remarkable;
(<any>window).renderMathInElement = renderMathInElement;
(<any>window).hljs = hljs;

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

if ( ! String.prototype.repeat) {

    String.prototype.repeat = function(count) {

        const input = '' + this;
        let result = '';

        for (let i = 0; i < count; ++i) {

            result += input;
        }
        return result;
    }
}

if ( ! Math.sign) {

    Math.sign = function(value) {

        return value < 0 ? -1 : (value == 0 ? 0 : 1);
    }
}