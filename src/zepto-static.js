(function (nx, global) {

  var DOMUtil = nx.DOMUtil;
  var document = global.document;
  var emptyArray = [],
    slice = emptyArray.slice,
    filter = emptyArray.filter;
  var supportContains = !!document.documentElement.contains;

  var ZeptoStatic = nx.declare('nx.ZeptoStatic', {
    statics: {
      parseJSON: JSON.parse,
      extend: function (target) {
        var deep, args = slice.call(arguments, 1);
        if (typeof target == 'boolean') {
          deep = target;
          target = args.shift();
        }
        args.forEach(function (arg) {
          DOMUtil.extend(target, arg, deep);
        });
        return target;
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
      }()),
      isEmptyObject: function (obj) {
        var key;
        for (key in obj) return false;
        return true;
      },
      inArray: function (elem, array, i) {
        return emptyArray.indexOf.call(array, elem, i)
      },
      camelCase: function (str) {
        return str.replace(/-+(.)?/g, function (match, chr) {
          return chr ? chr.toUpperCase() : ''
        });
      },
      trim: function (str) {
        return str == null ? "" : String.prototype.trim.call(str)
      },
      map: function (elements, callback) {
        var value, values = [], i, key;
        if (DOMUtil.likeArray(elements)) {
          for (i = 0; i < elements.length; i++) {
            value = callback(elements[i], i);
            if (value != null) {
              values.push(value);
            }
          }
        } else {
          for (key in elements) {
            value = callback(elements[key], key);
            if (value != null) {
              values.push(value);
            }
          }
        }
        return DOMUtil.flatten(values);
      },
      each: function (elements, callback) {
        var i, key;
        if (DOMUtil.likeArray(elements)) {
          for (i = 0; i < elements.length; i++) {
            if (callback.call(elements[i], i, elements[i]) === false) {
              return elements;
            }
          }
        } else {
          for (key in elements) {
            if (callback.call(elements[key], key, elements[key]) === false) {
              return elements;
            }
          }
        }
        return elements;
      },
      grep: function (elements, callback) {
        return filter.call(elements, callback)
      }
    }
  });


  nx.mix(
    nx.$,
    ZeptoStatic.__statics__
  );


}(nx, nx.GLOBAL));
