'use strict';

function mergeObjects(left, right) {
    var result = {};

    for(var key in left) {
        result[key] = left[key];
    }

    for(var key in right) {
        result[key] = right[key];
    }

    return result;
}

function inspectNodeTree(node) {
    var result = {
        name: node.$name,
        element: node.element,
        children: []
    };

    for(var i = 0; i < node.children.length; ++i) {
        result.children.push(inspectNodeTree(node.children[i]));
    }

    return result;
}

function defaultValue(value, variable) {
    if(typeof variable == 'undefined') {
        return value;
    } else {
        return variable;
    }
}

if(!Array.isArray) {
  Array.isArray = function (vArg) {
    return Object.prototype.toString.call(vArg) === "[object Array]";
  };
}
