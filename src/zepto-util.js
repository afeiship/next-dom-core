(function (nx, global) {

  var $ = nx.$;
  var document = global.document;
  var class2type = {}, elementDisplay = {}, classCache = {};
  var javascriptType = 'Boolean Number String Function Array Date RegExp Object Error';
  var toString = class2type.toString;
  var undefined;
  var cssNumber = {
    'column-count': 1,
    'columns': 1,
    'font-weight': 1,
    'line-height': 1,
    'opacity': 1,
    'z-index': 1,
    'zoom': 1
  };
  var emptyArray = [];
  var filter = emptyArray.filter,
    slice = emptyArray.slice,
    map = emptyArray.map,
    concat = emptyArray.concat;


  var DOMUtil = nx.declare('nx.DOMUtil', {
    statics: {
      init: function () {
        this.populateClass2Type();
      },
      populateClass2Type: function () {
        javascriptType.split(' ').forEach(function (name) {
          class2type["[object " + name + "]"] = name.toLowerCase()
        });
      },
      extend: function (target, source, deep) {
        var isPlainObject = DOMUtil.isPlainObject,
          isArray = DOMUtil.isArray;
        var key;
        for (key in source) {
          if (deep) {
            if (isPlainObject(source[key]) || isArray(source[key])) {
              if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
                target[key] = {};
              }
              if (isArray(source[key]) && !isArray(target[key])) {
                target[key] = [];
              }
              DOMUtil.extend(target[key], source[key], deep);
            }
          }
          else if (source[key] !== undefined) {
            target[key] = source[key];
          }
        }
      },
      likeArray: function (obj) {
        return typeof obj.length == 'number';
      },
      type: function (obj) {
        return obj == null ? String(obj) :
        class2type[toString.call(obj)] || 'object';
      },
      isArray: Array.isArray || function (obj) {
        return obj instanceof Array;
      },
      isDocument: function (obj) {
        return obj != null && obj.nodeType == 9;
      },
      isObject: function (obj) {
        return DOMUtil.type(obj) == 'object';
      },
      isString: function (obj) {
        return typeof(obj) == 'string';
      },
      isWindow: function (obj) {
        return obj != null && obj == obj.global;
      },
      isPlainObject: function (obj) {
        return DOMUtil.isObject(obj) && !DOMUtil.isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
      },
      isFunction: function (obj) {
        return typeof(obj) == 'function';
      },
      setAttribute: function (node, name, value) {
        value == null ? node.removeAttribute(name) : node.setAttribute(name, value);
      },
      className: function (node, value) {
        var klass = node.className || '',
          svg = klass && klass.baseVal !== undefined;

        if (value === undefined) return svg ? klass.baseVal : klass;
        svg ? (klass.baseVal = value) : (node.className = value)
      },
      deserializeValue: function (value) {
        try {
          return value ?
          value == "true" ||
          ( value == "false" ? false :
            value == "null" ? null :
              +value + "" == value ? +value :
                /^[\[\{]/.test(value) ? $.parseJSON(value) :
                  value )
            : value;
        } catch (e) {
          return value;
        }
      },
      dasherize: function (str) {
        return str.replace(/::/g, '/')
          .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
          .replace(/([a-z\d])([A-Z])/g, '$1_$2')
          .replace(/_/g, '-')
          .toLowerCase()
      },
      uniq: function (array) {
        return filter.call(array, function (item, idx) {
          return array.indexOf(item) == idx;
        });
      },
      classRE: function (name) {
        if (!name in classCache) {
          classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)');
        }
        return classCache[name];
      },
      maybeAddPx: function (name, value) {
        return (typeof value == 'number' && !cssNumber[DOMUtil.dasherize(name)]) ? value + 'px' : value
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
        return DOMUtil.isFunction(arg) ? arg.call(context, idx, payload) : arg;
      },
      flatten: function (array) {
        return array.length > 0 ? concat.apply([], array) : array;
      },
      traverseNode: function (node, fun) {
        fun(node);
        for (var i = 0, len = node.childNodes.length; i < len; i++) {
          DOMUtil.traverseNode(node.childNodes[i], fun);
        }
      },
      compact: function (array) {
        return filter.call(array, function (item) {
          return item != null;
        });
      }
    }
  });


}(nx, nx.GLOBAL));
