(function (nx, global) {

  var document = global.document;
  var readyRE = /complete|loaded|interactive/;

  nx.ready = function (callback) {
    if (readyRE.test(document.readyState) && document.body) {
      callback(nx);
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        callback(nx);
      }, false);
    }
    return this;
  };

}(nx, nx.GLOBAL));
