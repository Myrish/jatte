'use strict';

jatte.Macro = {
    create: function(macroDefinition) {
        macroDefinition = mergeObjects(
            jatte.__macroDefaults__,
            macroDefinition
        );

        var macroClassDefinition = {
            $name: "Macro_" + macroDefinition.name,

            $constants: {
                NAME: macroDefinition.name,
                IS_PAIR: macroDefinition.isPair
            },

            isClosed: true,
            data: macroDefinition.data,
            instance: null,
            args: [],

            initialize: function(instance) {
                this.instance = instance;

                this._init();
            },

            getName: function() {
                return this.$self.NAME;
            },

            isPair: function() {
                return this.$self.IS_PAIR;
            },

            open: function() {
                this.isClosed = false;
            },

            close: function() {
                this.isClosed = true;
            },

            render: function(scope, node, parentElement, beforeElement) {
                this._getArgs(scope);
                this._render(scope, this.args, node, parentElement, beforeElement);
            },

            update: function(scope, node) {
                this._getArgs(scope);
                this._update(scope, this.args, node);
            },

            remove: macroDefinition.remove,

            clone: function() {
                return new this.$self(this.instance);
            },

            _init: macroDefinition.init,
            _render: macroDefinition.render,
            _update: macroDefinition.update,

            _getArgs: function(scope) {
                for(var i = 0; i < this.instance.params.length; ++i) {
                    var arg = this.args[i];

                    if(arg) {
                        arg.oldValue = arg.value;
                        arg.value = this.instance.params[i].getValue(scope);
                        arg.changed = (arg.value != arg.oldValue);
                    } else {
                        this.args[i] = {
                            oldValue: undefined,
                            value: this.instance.params[i].getValue(scope),
                            changed: true
                        };
                    }
                }
            }
        };

        return dejavu.Class.declare(macroClassDefinition);
    }
}

jatte.__macroDefaults__ = {
    name: "",
    isPair: false,
    isClosed: true,
    data: {},

    init: function() {
    },

    render: function(scope, args, node, parentElement, beforeElement) {
        node.renderChildren(scope, parentElement, beforeElement);
    },

    update: function(scope, args, node) {
    },

    remove: function() {
    }
}
