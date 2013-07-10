jatte.Scope = function(parentScope, initialData) {
    parentScope = defaultValue(null, parentScope);
    initialData = defaultValue({}, initialData);

    var Scope = function() {};
    Scope.prototype = parentScope;

    var scope = new Scope();
    scope.$parent = parentScope;

    for(var property in initialData) {
        scope[property] = initialData[property];
    }

    return scope;
}
