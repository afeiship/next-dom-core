(function (nx, global) {

  var undefined;
  var document = global.document;
  var $ = nx.$;
  var emptyArray = [],
    slice = emptyArray.slice,
    map = emptyArray.map;
  var supportContains = !!document.documentElement.contains;
  var elementDisplay = {}, classCache = {};
  var cssNumber = {
    'column-count': 1,
    'columns': 1,
    'font-weight': 1,
    'line-height': 1,
    'opacity': 1,
    'z-index': 1,
    'zoom': 1
  };

  var ZeptoStatic = nx.declare('nx.zepto.ZeptoStatic', {
    statics: {
      setAttribute: function (node, name, value) {
        value == null ? node.removeAttribute(name) : node.setAttribute(name, value);
      },
      className: function (node, value) {
        var klass = node.className || '',
          svg = klass && klass.baseVal !== undefined;

        if (value === undefined) return svg ? klass.baseVal : klass;
        svg ? (klass.baseVal = value) : (node.className = value)
      },
      classRE: function (name) {
        if (!name in classCache) {
          classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)');
        }
        return classCache[name];
      },
      maybeAddPx: function (name, value) {
        return (typeof value == 'number' && !cssNumber[nx.dasherize(name)]) ? value + 'px' : value
      },
      defaultDisplay: function (nodeName) {
        var element, display;
        if (!elementDisplay[nodeName]) {
          element = document.createElement(nodeName);
          document.body.appendChild(element);
          display = getComputedStyle(element, '').getPropertyValue("display");
          element.parentNode.removeChild(element);
          display == "none" && (display = "block");
          elementDisplay[nodeName] = display;
        }
        return elementDisplay[nodeName];
      },
      children: function (element) {
        if ('children' in element) {
          return slice.call(element.children);
        } else {
          var nodes = element.childNodes;
          return map.call(nodes, function (node) {
            if (node.nodeType == 1) return node;
          });
        }
      },
      filtered: function (nodes, selector) {
        return selector == null ? $(nodes) : $(nodes).filter(selector)
      },
      funcArg: function (context, arg, idx, payload) {
        return nx.isFunction(arg) ? arg.call(context, idx, payload) : arg;
      },
      traverseNode: function (node, fun) {
        fun(node);
        for (var i = 0, len = node.childNodes.length; i < len; i++) {
          ZeptoStatic.traverseNode(node.childNodes[i], fun);
        }
      },
      contains: (function () {
        if (supportContains) {
          return function (parent, node) {
            return parent !== node && parent.contains(node)
          };
        } else {
          return function (parent, node) {
            while (node && (node = node.parentNode))
              if (node === parent) return true;
            return false;
          }
        }
      }())
    }
  });


  nx.mix(
    nx.$,
    ZeptoStatic.__statics__
  );


}(nx, nx.GLOBAL));
