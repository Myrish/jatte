'use strict';

jatte.DOMCompiler = dejavu.Class.declare({
    $name: "jatte.DOMCompiler",

    _template: null,

    initialize: function(template) {
        this._template = template;
    },

    compileHtmlElement: function(element, parentNode) {
        console.log("compile html");
        var node = new jatte.HTMLElementNode(parentNode, element);

        element = element.firstChild;
        while(element) {
            node = this.compile(element, node);

            var nextElement = element.nextSibling;

            element.parentNode.removeChild(element);

            element = nextElement;
        }

        if(node instanceof jatte.DirectiveNode && node.macro.isClosed == false) {
            throw "open macro error";
        }

        return parentNode;
    },

    compileTextElement: function(element, parentNode) {
        console.log("compile text");
        var text = element.nodeValue;

        var parsedText = jatte.TextParser.parse(text);

        var textBuffer = [];
        for(var i = 0; i < parsedText.length; ++i) {
            var parsedToken = parsedText[i];

            if(parsedToken.type == "text") {
                textBuffer.push(parsedToken.value);
            }
            
            if(parsedToken.type != "text" || i == parsedText.length - 1) {
                if(textBuffer.length > 0) {
                    new jatte.TextNode(parentNode, textBuffer.join(''));

                    textBuffer = [];
                }
            }

            if(parsedToken.type == "macro") {
                var Macro = this._template.getMacro(parsedToken.value.name);
                if(Macro) {
                    var macro = new Macro(parsedToken.value);
                    var node = new jatte.DirectiveNode(parentNode, macro);

                    console.log([Macro.NAME, Macro.IS_PAIR, inspectNodeTree(parentNode.parent)]);
                    if(Macro.IS_PAIR) {
                        console.log("change parent");
                        parentNode = node;
                    }
                } else {
                    // TODO error
                    throw "unknown macro '" + parsedToken.value.name + "'";
                }
            } else if(parsedToken.type == "end_macro") {
                var pairMacroIsOpened =
                    parentNode instanceof jatte.DirectiveNode
                    && parentNode.macro.isPair();

                if(pairMacroIsOpened && parentNode.macro.getName() == parsedToken.value) {
                    parentNode.macro.isClosed = true;
                    parentNode = parentNode.parent;
                } else {
                    // TODO error
                    throw "end macro '" + parsedToken.value + "' error";
                }

                console.inspect(parentNode);
            }
        }

        return parentNode;
    },

    compileCustomElement: function(element, parentNode) {
        console.log("compile custom");
        new jatte.ElementNode(parentNode, element);

        return parentNode;
    },

    compile: function(element, parentNode) {
        console.dir(element);
        var node = null;

        switch(element.nodeType) {
            case Node.ELEMENT_NODE:
                node = this.compileHtmlElement(element, parentNode);
                break;
            case Node.TEXT_NODE:
                node = this.compileTextElement(element, parentNode);
                break;
            default:
                node = this.compileCustomElement(element, parentNode);
                break;
        }

        return node;
    }
});
