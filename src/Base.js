(function (nx, global) {

  var undefined;
  var document = global.document;
  var readyRE = /complete|loaded|interactive/;
  var singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;
  var tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig;
  var fragmentRE = /^\s*<(\w+|!)[^>]*>/;
  var simpleSelectorRE = /^[\w-]*$/;
  var table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table,
      'thead': table,
      'tfoot': table,
      'td': tableRow,
      'th': tableRow,
      '*': document.createElement('div')
    };
  var methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'];
  var supportContains = !!document.documentElement.contains;


  nx.ready = function (callback) {
    if (readyRE.test(document.readyState) && document.body) {
      callback(nx);
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        callback(nx);
      }, false);
    }
  };


  nx.matches = function (element, selector) {
    if (!selector || !element || element.nodeType !== 1) {
      return false;
    }
    var matchesSelector = element.matches
      || element.webkitMatchesSelector
      || element.mozMatchesSelector
      || element.oMatchesSelector
      || element.matchesSelector;

    if (matchesSelector) {
      return matchesSelector.call(element, selector);
    }

    var matches = (element.document || element.ownerDocument).querySelectorAll(selector),
      i = matches.length;
    while (--i >= 0 && matches.item(i) !== element) ;
    return i > -1;
  };


  nx.fragment = function (html, name, properties) {
    var dom, nodes, container;
    if (singleTagRE.test(html)) {
      dom = nx.$(document.createElement(RegExp.$1));
    }

    if (!dom) {
      if (html.replace) {
        html = html.replace(tagExpanderRE, "<$1></$2>");
      }

      if (name === undefined) {
        name = fragmentRE.test(html) && RegExp.$1;
      }

      if (!(name in containers)) {
        name = '*';
      }

      container = containers[name];
      container.innerHTML = '' + html;
      dom = nx.each(nx.toArray(container.childNodes), function () {
        container.removeChild(this);
      });
    }

    if (nx.isPlainObject(properties)) {
      nodes = nx.$(dom);
      nx.each(properties, function (key, value) {
        if (methodAttributes.indexOf(key) > -1) {
          nodes[key](value);
        } else {
          nodes.attr(key, value);
        }
      });
    }

    return dom;
  };

  nx.qsa = function (element, selector) {
    var result, maybeId = selector[0] === '#',
      maybeClass = !maybeId && selector[0] == '.',
      nameOnly = (maybeId || maybeClass) ? selector.slice(1) : selector,
      isSimple = simpleSelectorRE.test(nameOnly);
    if (nx.isDocument(element) && isSimple && maybeId) {
      result = element.getElementById(nameOnly);
    } else {
      if (element.nodeType == 1 || element.nodeType == 9) {
        if (isSimple && !maybeId) {
          if (maybeClass) {
            result = element.getElementsByClassName(nameOnly);
          } else {
            result = element.getElementsByTagName(selector);
          }
        } else {
          result = element.querySelector(selector);
        }
      }
    }
    return nx.toArray(result);
  };


  nx.contains = (function () {
    if (supportContains) {
      return function (parent, node) {
        return parent !== node && parent.contains(node)
      };
    } else {
      return function (parent, node) {
        while (node && (node = node.parentNode))
          if (node === parent) return true;
        return false;
      };
    }
  }());

  nx.map = function (elements, callback) {
    var value, values = [], i, key;
    if (nx.isArrayLike(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i);
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key);
        if (value != null) values.push(value)
      }
    return nx.toArray(values);
  };


}(nx, nx.GLOBAL));
