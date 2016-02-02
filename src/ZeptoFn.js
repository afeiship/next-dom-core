(function (nx, global) {

  var document = global.document, undefined;
  var $ = nx.$;
  var key;
  var classList;
  var emptyArray = [],
    slice = emptyArray.slice,
    filter = emptyArray.filter,
    map = emptyArray.map;
  var capitalRE = /([A-Z])/g;
  var rootNodeRE = /^(?:body|html)$/i;
  var propMap = {
    'tabindex': 'tabIndex',
    'readonly': 'readOnly',
    'for': 'htmlFor',
    'class': 'className',
    'maxlength': 'maxLength',
    'cellspacing': 'cellSpacing',
    'cellpadding': 'cellPadding',
    'rowspan': 'rowSpan',
    'colspan': 'colSpan',
    'usemap': 'useMap',
    'frameborder': 'frameBorder',
    'contenteditable': 'contentEditable'
  };
  var adjacencyOperators = ['after', 'prepend', 'before', 'append'];
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


  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value);
  }

  function className(node, value) {
    var klass = node.className || '',
      svg = klass && klass.baseVal !== undefined;

    if (value === undefined) return svg ? klass.baseVal : klass;
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  function classRE(name) {
    if (!name in classCache) {
      classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)');
    }
    return classCache[name];
  }

  function maybeAddPx(name, value) {
    return (typeof value == 'number' && !cssNumber[nx.dasherize(name)]) ? value + 'px' : value
  }

  function defaultDisplay(nodeName) {
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
  }

  function children(element) {
    if ('children' in element) {
      return slice.call(element.children);
    } else {
      var nodes = element.childNodes;
      return map.call(nodes, function (node) {
        if (node.nodeType == 1) return node;
      });
    }
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  function funcArg(context, arg, idx, payload) {
    return nx.isFunction(arg) ? arg.call(context, idx, payload) : arg;
  }

  function traverseNode(node, fun) {
    fun(node);
    for (var i = 0, len = node.childNodes.length; i < len; i++) {
      traverseNode(node.childNodes[i], fun);
    }
  }


  var ZeptoFn = nx.declare('nx.zepto.Fn', {
    statics: {
      forEach: emptyArray.forEach,
      reduce: emptyArray.reduce,
      push: emptyArray.push,
      sort: emptyArray.sort,
      indexOf: emptyArray.indexOf,
      concat: emptyArray.concat,
      map: function (fn) {
        return $(
          nx.map(this, function (el, i) {
            return fn.call(el, i, el)
          })
        );
      },
      slice: function () {
        return $(
          slice.apply(this, arguments)
        );
      },
      get: function (idx) {
        return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
      },
      toArray: function () {
        return this.get();
      },
      size: function () {
        return this.length;
      },
      remove: function () {
        return this.each(function () {
          if (this.parentNode != null) {
            this.parentNode.removeChild(this);
          }
        });
      },
      each: function (callback) {
        emptyArray.every.call(this, function (el, idx) {
          return callback.call(el, idx, el) !== false;
        });
        return this;
      },
      filter: function (selector) {
        if (nx.isFunction(selector)) {
          return this.not(this.not(selector));
        }
        return $(
          filter.call(this, function (element) {
            return nx.matches(element, selector);
          })
        );
      },
      add: function (selector, context) {
        return $(
          nx.unique(this.concat($(selector, context)))
        );
      },
      is: function (selector) {
        return this.length > 0 && nx.matches(this[0], selector);
      },
      not: function (selector) {
        var nodes = [];
        if (nx.isFunction(selector) && selector.call !== undefined)
          this.each(function (idx) {
            if (!selector.call(this, idx)) nodes.push(this)
          });
        else {
          var excludes = typeof selector == 'string' ? this.filter(selector) :
            (nx.isArrayLike(selector) && nx.isFunction(selector.item)) ? slice.call(selector) : $(selector);
          this.forEach(function (el) {
            if (excludes.indexOf(el) < 0) nodes.push(el)
          });
        }
        return $(nodes);
      },
      has: function (selector) {
        return this.filter(function () {
          return nx.isObject(selector) ?
            $.contains(this, selector) :
            $(this).find(selector).size();
        })
      },
      eq: function (idx) {
        return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1);
      },
      first: function () {
        var el = this[0];
        return el && !nx.isObject(el) ? el : $(el);
      },
      last: function () {
        var el = this[this.length - 1];
        return el && !nx.isObject(el) ? el : $(el);
      },
      find: function (selector) {
        var result, $this = this;
        if (!selector) result = $();
        else if (typeof selector == 'object')
          result = $(selector).filter(function () {
            var node = this;
            return emptyArray.some.call($this, function (parent) {
              return nx.contains(parent, node)
            })
          });
        else if (this.length == 1) result = $(nx.qsa(this[0], selector));
        else result = this.map(function () {
            return nx.qsa(this, selector)
          });
        return result;
      },
      closest: function (selector, context) {
        var node = this[0], collection = false;
        if (typeof selector == 'object') collection = $(selector);
        while (node && !(collection ? collection.indexOf(node) >= 0 : nx.matches(node, selector)))
          node = node !== context && !nx.isDocument(node) && node.parentNode;
        return $(node);
      },
      parents: function (selector) {
        var ancestors = [], nodes = this;
        while (nodes.length > 0)
          nodes = nx.map(nodes, function (node) {
            if ((node = node.parentNode) && !nx.isDocument(node) && ancestors.indexOf(node) < 0) {
              ancestors.push(node);
              return node;
            }
          });
        return filtered(ancestors, selector)
      },
      parent: function (selector) {
        return filtered(nx.unique(this.pluck('parentNode')), selector)
      },
      children: function (selector) {
        return filtered(this.map(function () {
          return children(this)
        }), selector)
      },
      contents: function () {
        return this.map(function () {
          return slice.call(this.childNodes)
        })
      },
      siblings: function (selector) {
        return filtered(this.map(function (i, el) {
          return filter.call(children(el.parentNode), function (child) {
            return child !== el
          })
        }), selector);
      },
      empty: function () {
        return this.each(function () {
          this.innerHTML = ''
        })
      },
      // `pluck` is borrowed from Prototype.js
      pluck: function (property) {
        return nx.map(this, function (el) {
          return el[property]
        });
      },
      show: function () {
        return this.each(function () {
          this.style.display == 'none' && (this.style.display = '');
          if (getComputedStyle(this, '').getPropertyValue('display') == 'none')
            this.style.display = defaultDisplay(this.nodeName)
        })
      },
      replaceWith: function (newContent) {
        return this.before(newContent).remove()
      },
      wrap: function (structure) {
        var func = nx.isFunction(structure);
        if (this[0] && !func)
          var dom = $(structure).get(0),
            clone = dom.parentNode || this.length > 1;

        return this.each(function (index) {
          $(this).wrapAll(
            func ? structure.call(this, index) :
              clone ? dom.cloneNode(true) : dom
          )
        })
      },
      wrapAll: function (structure) {
        if (this[0]) {
          $(this[0]).before(structure = $(structure));
          var children;
          // drill down to the inmost element
          while ((children = structure.children()).length) structure = children.first();
          $(structure).append(this);
        }
        return this;
      },
      wrapInner: function (structure) {
        var func = nx.isFunction(structure);
        return this.each(function (index) {
          var self = $(this), contents = self.contents(),
            dom = func ? structure.call(this, index) : structure;
          contents.length ? contents.wrapAll(dom) : self.append(dom)
        })
      },
      unwrap: function () {
        this.parent().each(function () {
          $(this).replaceWith($(this).children())
        });
        return this;
      },
      clone: function () {
        return this.map(function () {
          return this.cloneNode(true);
        });
      },
      hide: function () {
        return this.css('display', 'none');
      },
      toggle: function (setting) {
        return this.each(function () {
          var el = $(this);
          (setting === undefined ? el.css('display') == 'none' : setting) ? el.show() : el.hide()
        })
      },
      prev: function (selector) {
        return $(this.pluck('previousElementSibling')).filter(selector || '*');
      },
      next: function (selector) {
        return $(this.pluck('nextElementSibling')).filter(selector || '*');
      },
      html: function (html) {
        return 0 in arguments ?
          this.each(function (idx) {
            var originHtml = this.innerHTML;
            $(this).empty().append(funcArg(this, html, idx, originHtml));
          }) :
          (0 in this ? this[0].innerHTML : null);
      },
      text: function (text) {
        return 0 in arguments ?
          this.each(function (idx) {
            var newText = funcArg(this, text, idx, this.textContent);
            this.textContent = newText == null ? '' : '' + newText
          }) :
          (0 in this ? this[0].textContent : null)
      },
      attr: function (name, value) {
        var result;
        return (typeof name == 'string' && !(1 in arguments)) ?
          (!this.length || this[0].nodeType !== 1 ? undefined :
              (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
          ) :
          this.each(function (idx) {
            if (this.nodeType !== 1) return;
            if (nx.isObject(name)) for (key in name) setAttribute(this, key, name[key]);
            else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)));
          })
      },
      removeAttr: function (name) {
        return this.each(function () {
          this.nodeType === 1 && name.split(' ').forEach(function (attribute) {
            setAttribute(this, attribute)
          }, this);
        })
      },
      prop: function (name, value) {
        name = propMap[name] || name;
        return (1 in arguments) ?
          this.each(function (idx) {
            this[name] = funcArg(this, value, idx, this[name])
          }) :
          (this[0] && this[0][name]);
      },
      data: function (name, value) {
        var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase();

        var data = (1 in arguments) ?
          this.attr(attrName, value) :
          this.attr(attrName);

        return data !== null ? nx.deserializeValue(data) : undefined;
      },
      val: function (value) {
        return 0 in arguments ?
          this.each(function (idx) {
            this.value = funcArg(this, value, idx, this.value)
          }) :
          (this[0] && (this[0].multiple ?
              $(this[0]).find('option').filter(function () {
                return this.selected
              }).pluck('value') :
              this[0].value)
          )
      },
      offset: function (coordinates) {
        if (coordinates) return this.each(function (index) {
          var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top: coords.top - parentOffset.top,
              left: coords.left - parentOffset.left
            };

          if ($this.css('position') == 'static') props['position'] = 'relative';
          $this.css(props);
        });
        if (!this.length) return null;
        var obj = this[0].getBoundingClientRect();
        return {
          left: obj.left + window.pageXOffset,
          top: obj.top + window.pageYOffset,
          width: Math.round(obj.width),
          height: Math.round(obj.height)
        }
      },
      css: function (property, value) {
        if (arguments.length < 2) {
          var computedStyle, element = this[0];
          if (!element) return;
          computedStyle = getComputedStyle(element, '');
          if (typeof property == 'string')
            return element.style[$.camelCase(property)] || computedStyle.getPropertyValue(property);
          else if (nx.isArray(property)) {
            var props = {};
            nx.each(property, function (_, prop) {
              props[prop] = (element.style[$.camelCase(prop)] || computedStyle.getPropertyValue(prop))
            });
            return props;
          }
        }

        var css = '';
        if (nx.type(property) == 'string') {
          if (!value && value !== 0)
            this.each(function () {
              this.style.removeProperty(nx.dasherize(property))
            });
          else
            css = nx.dasherize(property) + ':' + maybeAddPx(property, value)
        } else {
          for (key in property)
            if (!property[key] && property[key] !== 0)
              this.each(function () {
                this.style.removeProperty(nx.dasherize(key))
              });
            else
              css += nx.dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';';
        }

        return this.each(function () {
          this.style.cssText += ';' + css
        })
      },
      index: function (element) {
        return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
      },
      hasClass: function (name) {
        if (!name) return false;
        return emptyArray.some.call(this, function (el) {
          return this.test(className(el))
        }, classRE(name))
      },
      addClass: function (name) {
        if (!name) return this;
        return this.each(function (idx) {
          if (!('className' in this)) return;
          classList = [];
          var cls = className(this), newName = funcArg(this, name, idx, cls);
          newName.split(/\s+/g).forEach(function (klass) {
            if (!$(this).hasClass(klass)) classList.push(klass)
          }, this);
          classList.length && className(this, cls + (cls ? ' ' : '') + classList.join(' '))
        })
      },
      removeClass: function (name) {
        return this.each(function (idx) {
          if (!('className' in this)) return;
          if (name === undefined) return className(this, '');
          classList = className(this);
          funcArg(this, name, idx, classList).split(/\s+/g).forEach(function (klass) {
            classList = classList.replace(classRE(klass), ' ')
          });
          className(this, classList.trim())
        })
      },
      toggleClass: function (name, when) {
        if (!name) return this;
        return this.each(function (idx) {
          var $this = $(this), names = funcArg(this, name, idx, className(this));
          names.split(/\s+/g).forEach(function (klass) {
            (when === undefined ? !$this.hasClass(klass) : when) ?
              $this.addClass(klass) : $this.removeClass(klass)
          })
        })
      },
      scrollTop: function (value) {
        if (!this.length) return;
        var hasScrollTop = 'scrollTop' in this[0];
        if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset;
        return this.each(hasScrollTop ?
          function () {
            this.scrollTop = value
          } :
          function () {
            this.scrollTo(this.scrollX, value)
          })
      },
      scrollLeft: function (value) {
        if (!this.length) return;
        var hasScrollLeft = 'scrollLeft' in this[0];
        if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset;
        return this.each(hasScrollLeft ?
          function () {
            this.scrollLeft = value
          } :
          function () {
            this.scrollTo(value, this.scrollY)
          })
      },
      position: function () {
        if (!this.length) return;

        var elem = this[0],
        // Get *real* offsetParent
          offsetParent = this.offsetParent(),
        // Get correct offsets
          offset = this.offset(),
          parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? {top: 0, left: 0} : offsetParent.offset();

        // Subtract element margins
        // note: when an element has margin: auto the offsetLeft and marginLeft
        // are the same in Safari causing offset.left to incorrectly be 0
        offset.top -= parseFloat($(elem).css('margin-top')) || 0;
        offset.left -= parseFloat($(elem).css('margin-left')) || 0;

        // Add offsetParent borders
        parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0;
        parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0;

        // Subtract the two offsets
        return {
          top: offset.top - parentOffset.top,
          left: offset.left - parentOffset.left
        }
      },
      offsetParent: function () {
        return this.map(function () {
          var parent = this.offsetParent || document.body;
          while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css('position') == 'static')
            parent = parent.offsetParent;
          return parent;
        })
      }
    }
  });


  adjacencyOperators.forEach(function (operator, operatorIndex) {
    var inside = operatorIndex % 2;

    $.fn[operator] = function () {
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function (arg) {
          argType = nx.type(arg);
          if (argType == 'object' || argType == 'array' || arg == null) {
            return arg;
          } else {
            return nx.fragment(arg);
          }
        }),
        parent, copyByClone = this.length > 1;
      if (nodes.length < 1) {
        return this;
      }

      return this.each(function (_, target) {
        parent = inside ? target : target.parentNode;

        // convert all methods to a 'before' operation
        target = operatorIndex == 0 ? target.nextSibling :
          operatorIndex == 1 ? target.firstChild :
            operatorIndex == 2 ? target :
              null;

        var parentInDocument = nx.contains(document.documentElement, parent);

        nodes.forEach(function (node) {
          if (copyByClone) {
            node = node.cloneNode(true);
          } else if (!parent) {
            return $(node).remove();
          }

          parent.insertBefore(node, target);
          if (parentInDocument) {
            traverseNode(node, function (el) {
              if (
                el.nodeName != null
                && el.nodeName.toUpperCase() === 'SCRIPT'
                && (!el.type || el.type === 'text/javascript')
                && !el.src
              ) {
                global['eval'].call(global, el.innerHTML);
              }
            });
          }
        })
      })
    };

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')] = function (html) {
      $(html)[operator](this);
      return this;
    }
  });

  nx.mix(
    $.fn,
    ZeptoFn.__statics__
  );


}(nx, nx.GLOBAL));
