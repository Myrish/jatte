jatte.MacroRepeat = {
    name: "repeat",
    isPair: true,

    render: function(scope, args, node, parentElement, beforeElement) {
        this.data.placeholderElement = parentElement.insertBefore(document.createComment(" #repeat "), beforeElement);
        this.data.renderedNodes = [];

        this.update(scope, node);
    },

    update: function(scope, args, node) {
        if(Array.isArray(args[0].value)) {
            var items = args[0].value;

            var index = 0;
            while(index < items.length) {
                var itemScope = new jatte.Scope(scope, {
                    $item: items[index]
                });

                if(index < this.data.renderedNodes.length) {
                    this.data.renderedNodes[index].update(itemScope);
                } else {
                    var itemNode = new jatte.Node();
                    node.cloneChildren(true, itemNode);

                    console.log("item node");
                    console.log(itemNode);

                    console.dir(this.data.placeholderElement.parentNode);
                    itemNode.render(itemScope, this.data.placeholderElement.parentNode, this.data.placeholderElement);

                    this.data.renderedNodes.push(itemNode);
                }

                ++index;
            }

            while(items.length < this.data.renderedNodes.length) {
                var node = this.data.renderedNodes.pop();
                node.remove();
            }
        }
    },

    remove: function() {
        this.data.placeholderElement.parentNode.removeChild(this.data.placeholderElement);

        while(items.length < this.data.renderedNodes.length) {
            var node = this.data.renderedNodes.pop();
            node.remove();
        }
    }
};

jatte.MacroPrint = {
    name: "print",

    render: function(scope, args, node, parentElement, beforeElement) {
        this.data.element = document.createTextNode(args[0].value || "");

        parentElement.insertBefore(this.data.element, beforeElement);
    },

    update: function(scope, args, node) {
        if(args[0].changed) {
            this.data.element.nodeValue = args[0].value || "";
        }
    },

    remove: function() {
        this.data.element.parentNode.removeChild(this.data.element);
    }
}

jatte.MacroIf = {
    name: "if",
    isPair: true,

    render: function(scope, args, node, parentElement, beforeElement) {
        this.data.placeholderElement = parentElement.insertBefore(document.createComment(" #if "), beforeElement);
        if(args[0].value) {
            node.renderChildren(scope, parentElement, beforeElement);
        }
    },

    update: function(scope, args, node) {
        if(args[0].changed) {
            if(args[0].value) {
                node.renderChildren(scope, this.data.placeholderElement.parentNode, this.data.placeholderElement.nextSibling);
            } else {
                node.removeChildren();
            }
        }
    },

    remove: function() {
        this.data.placeholderElement.parentNode.removeChild(this.data.placeholderElement);
        node.removeChildren();
    }
}

jatte.Template.registerMacro(jatte.MacroRepeat);
jatte.Template.registerMacro(jatte.MacroPrint);
jatte.Template.registerMacro(jatte.MacroIf);
