'use strict';

jatte.Node = dejavu.Class.declare({
    $name: "jatte.Node",

    parent: null,
    children: [],

    isRendered: false,

    initialize: function(parent) {
        this.parent = parent || null;

        if(parent) {
            parent.children.push(this);
        }
    },

    render: function(scope, parentElement, beforeElement, renderChildren) {
        beforeElement = defaultValue(null, beforeElement);
        renderChildren = defaultValue(true, renderChildren);

        this._render(scope, parentElement, beforeElement, renderChildren);

        this.isRendered = true;
    },

    renderChildren: function(scope, parentElement, beforeElement) {
        for(var i = 0; i < this.children.length; ++i) {
            this.children[i].render(scope, parentElement, beforeElement);
        }
    },

    update: function(scope, updateChildren) {
        updateChildren = defaultValue(true, updateChildren);

        if(this.isRendered) {
            this._update(scope, updateChildren);
        }
    },

    updateChildren: function(scope) {
        for(var i = 0; i < this.children.length; ++i) {
            this.children[i].update(scope);
        }
    },

    remove: function() {
        if(this.isRendered) {
            this._remove();
            this.removeChildren();

            this.isRendered = false;
        }
    },

    removeChildren: function() {
        for(var i = 0; i < this.children.length; ++i) {
            this.children[i].remove();
        }
    },

    clone: function(deep, parentNode) {
        deep = defaultValue(true, deep);
        parentNode = defaultValue(null, parentNode);

        var clone = this._clone(parentNode);

        if(deep) {
            this.cloneChildren(deep, clone);
        }

        return clone;
    },

    cloneChildren: function(deep, parentNode) {
        var clones = [];

        for(var i = 0; i < this.children.length; ++i) {
            clones.push(this.children[i].clone(deep, parentNode));
        }

        return clones;
    },

    _render: function(scope, parentElement, beforeElement, renderChildren) {
        if(renderChildren) {
            this.renderChildren(scope, parentElement, beforeElement);
        }
    },

    _update: function(scope, updateChildren) {
        if(updateChildren) {
            this.updateChildren(scope);
        }
    },

    _remove: function() {},

    _clone: function(parentNode) {
        return new jatte.Node(parentNode);
    }
});

jatte.ElementNode = dejavu.Class.declare({
    $name: "jatte.ElementNode",
    $extends: jatte.Node,

    element: null,

    initialize: function(parent, element) {
        this.$super(parent);
        this.element = element;
    },

    _render: function(scope, parentElement, beforeElement, renderChildren) {
        parentElement.insertBefore(this.element, beforeElement);

        if(renderChildren) {
            this.renderChildren(scope, this.element);
        }
    },

    _remove: function() {
        this.element.parentNode.removeChild(this.element);
    },

    _clone: function(parentNode) {
        return new jatte.ElementNode(parentNode, this.element.cloneNode(false));
    }
});

jatte.HTMLElementNode = dejavu.Class.declare({
    $name: "jatte.HTMLElementNode",
    $extends: jatte.ElementNode,

    initialize: function(parent, htmlElement) {
        this.$super(parent, htmlElement);
    },

    _clone: function(parentNode) {
        return new jatte.HTMLElementNode(parentNode, this.element.cloneNode(false));
    }
});

jatte.TextNode = dejavu.Class.declare({
    $name: "jatte.TextNode",
    $extends: jatte.ElementNode,

    text: null,

    initialize: function(parent, text) {
        this.$super(parent, document.createTextNode(text));
        this.text = text;
    },

    _clone: function(parentNode) {
        return new jatte.TextNode(parentNode, this.text);
    }
});

jatte.DirectiveNode = dejavu.Class.declare({
    $name: "jatte.DirectiveNode",
    $extends: jatte.Node,

    macro: null,

    initialize: function(parent, macro) {
        this.$super(parent);
        this.macro = macro;
    },

    _render: function(scope, parentElement, beforeElement) {
        this.macro.render(scope, this, parentElement, beforeElement);
    },

    _update: function(scope) {
        this.macro.update(scope, this);
    },

    _remove: function() {
        this.macro.remove();
    },

    _clone: function(parentNode) {
        return new jatte.DirectiveNode(parentNode, this.macro.clone());
    }
});
