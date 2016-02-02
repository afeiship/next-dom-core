(function (nx, global) {

  var document = global.document, undefined;
  var fragmentRE = /^\s*<(\w+|!)[^>]*>/;

  var Zepto = nx.declare('nx.zepto.Core', {
    statics: {
      start: function (selector, context) {
        var dom;
        if (!selector) {
          return Zepto.Z();
        } else if (typeof selector == 'string') {
          selector = selector.trim();
          // If it's a html fragment, create nodes from it
          // Note: In both Chrome 21 and Firefox 15, DOM error 12
          // is thrown if the fragment doesn't begin with <
          if (selector[0] == '<' && fragmentRE.test(selector)) {
            dom = nx.fragment(selector, RegExp.$1, context);
            selector = null;
          } else if (context !== undefined) {
            // If there's a context, create a collection on that context first, and select
            // nodes from there
            return nx.$(context).find(selector);
          } else {
            // If it's a CSS selector, use it to select nodes.
            dom = nx.qsa(document, selector);
          }
        }
        // If a function is given, call it when the DOM is ready
        else if (nx.isFunction(selector)) return nx.$(document).ready(selector);
        // If a Zepto collection is given, just return it
        else if (Zepto.isZ(selector)) return selector;
        else {
          // normalize array if an array of nodes is given
          if (nx.isArray(selector)) dom = nx.compact(selector);
          // Wrap DOM nodes.
          else if (nx.isObject(selector))
            dom = [selector], selector = null;
          // If it's a html fragment, create nodes from it
          else if (fragmentRE.test(selector))
            dom = nx.fragment(selector.trim(), RegExp.$1, context), selector = null;
          // If there's a context, create a collection on that context first, and select
          // nodes from there
          else if (context !== undefined) return nx.$(context).find(selector);
          // And last but no least, if it's a CSS selector, use it to select nodes.
          else dom = nx.qsa(document, selector);
        }
        // create a new Zepto collection from the nodes found
        return Zepto.Z(dom, selector);
      },
      Z: function (dom, selector) {
        dom = dom || [];
        dom.__proto__ = nx.$.fn;
        dom.selector = selector || '';
        return dom;
      },
      isZ: function (obj) {
        return obj instanceof Zepto.Z;
      }
    }
  });


  nx.$ = function (selector, context) {
    return Zepto.start(selector, context);
  };

  nx.$.fn = {};



  nx.mix(nx.$,{

  })




}(nx, nx.GLOBAL));
