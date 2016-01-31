(function (nx, global) {

  var DOMUtil = nx.DOMUtil;
  var document = global.document, undefined;
  var singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;
  var tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig;
  var fragmentRE = /^\s*<(\w+|!)[^>]*>/;
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
  var emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter;

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
      dom = DOMUtil.each(slice.call(container.childNodes), function () {
        container.removeChild(this);
      });
    }

    if (DOMUtil.isPlainObject(properties)) {
      nodes = nx.$(dom);
      DOMUtil.each(properties, function (key, value) {
        if (methodAttributes.indexOf(key) > -1) {
          nodes[key](value);
        } else {
          nodes.attr(key, value);
        }
      });
    }

    return dom;
  };

}(nx, nx.GLOBAL));
