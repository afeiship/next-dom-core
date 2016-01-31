(function (nx, global) {

  var simpleSelectorRE = /^[\w-]*$/;
  var emptyArray = [];
  var slice = emptyArray.slice;

  function isDocument(obj) {
    return obj != null && obj.nodeType == 9;
  }

  function toArray(obj) {
    if (!obj) return [];
    if (obj.length === +obj.length) return slice.call(obj);
    return [obj];
  }

  nx.qsa = function (element, selector) {
    var result, maybeId = selector[0] === '#',
      maybeClass = !maybeId && selector[0] == '.',
      nameOnly = (maybeId || maybeClass) ? selector.slice(1) : selector,
      isSimple = simpleSelectorRE.test(nameOnly);
    if (isDocument(element) && isSimple && maybeId) {
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
    return toArray(result);
  };
}(nx, nx.GLOBAL));
