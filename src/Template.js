'use strict';

jatte.TemplateMeta = {
    registerMacro: function(macroDefinition) {
        var Macro = jatte.Macro.create(macroDefinition);

        this._macros[Macro.NAME] = Macro;
    }
}

jatte.Template = dejavu.Class.declare({
    $name: "jatte.Template",

    scope: null,

    _element: null,
    _rootNode: null,
    _macros: {},

    _compiler: null,

    initialize: function(element, scope) {
        this.scope = new jatte.Scope(scope);

        this._element = element;

        this._compiler = new jatte.DOMCompiler(this);

        if(this._element) {
            this.compile();
        }
    },

    compile: function() {
        this._rootNode = new jatte.Node();
        this._compiler.compile(this._element, this._rootNode);
        console.dir(inspectNodeTree(this._rootNode));
    },

    render: function() {
        var parentElement = this._element.parentNode;
        parentElement.removeChild(this._element);

        this._rootNode.children[0].render(this.scope, parentElement);        
    },

    update: function() {
        this._rootNode.children[0].update(this.scope);
    },

    registerMacro: jatte.TemplateMeta.registerMacro,

    getMacro: function(macroName) {
        var Macro = this._macros[macroName];

        if(! Macro) {
            console.log(this);
            Macro = this.$self._macros[macroName];
        }

        return Macro;
    },

    $statics: {
        _macros: {},
        registerMacro: jatte.TemplateMeta.registerMacro
    }
});
