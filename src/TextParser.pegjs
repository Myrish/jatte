start
    = (directive / text)*



/*** SETTINGS ***/

directive_start
    = "{"

directive_end
    = "}"

macro_start_sign
    = "#"

macro_end_sign
    = "/"

param_delimiter
    = ","



/*** DIRECTIVE ***/

directive
    = expression_directive
    / macro_directive
    / end_macro_directive

expression_directive
    = directive_start __ expression:expression __ directive_end
    {
        return {
            type: "macro",
            value: {
                name: "print",
                params: [expression],
                isExplicitlyEnded: false
            }
        };
    }

macro_directive
    = directive_start macro_start_sign macro:macro __ end:macro_end_sign? directive_end
    {
        macro.isExplicitlyEnded = end ? true : false;

        return {
            type: "macro",
            value: macro
        };
    }

macro
    = name:identifier params:(_ params)?
    {
        return {
            name: name,
            params: params ? params[1] : []
        };
    }

end_macro_directive
    = directive_start macro_end_sign macro:identifier directive_end
    {
        return {
            type: "end_macro",
            value: macro
        }
    }




/*** EXPRESSION ***/

expression
    = function_call
    / reference
    / literal

function_call
    = name:identifier "(" __ params:params? __ ")"
    {
        return {
            getValue: function(scope) {
                var value = null;

                var args = [];

                for(var i = 0; params && i < params.length; ++i) {
                    args.push(params[i].getValue(scope));
                }

                return scope[name].apply(null, args);
            }
        };
    }

reference
    = identifier:identifier accessors:(array_access / property_access)*
    {
        return {
            getValue: function(scope) {
                var value = scope[identifier];

                if(! value) return undefined;

                for(var i = 0; accessors && i < accessors.length; ++i) {
                    value = value[accessors[i].getValue(scope)];

                    if(! value) return undefined;
                }

                return value;
            }
        };
    }

literal
    = value:(undefined / null / boolean /  number / string)
    {
        return {
            getValue: function() {
                return value;
            }
        };
    }

array_access
    = __ "[" __ expression:expression __ "]"
    {
        return expression;
    }

property_access
    = __ "." __ identifier:identifier
    {
        return {
            getValue: function(scope) {
                return identifier;
            }
        };
    }

undefined
    = "undefined"
    {
        return {
            getValue: function(scope) {
                return undefined;
            }
        };
    }

null
    = "null"
    {
        return {
            getValue: function(scope) {
                return null;
            }
        };
    }

boolean
    = value:("true" { return true; } / "false" { return false; })
    {
        return {
            getValue: function(scope) {
                return value;
            }
        };
    }
 
number
    = first:[1-9] rest:[0-9]*
    {
        return parseInt(first + rest.join(''));
    }
// TODO decimal

string
    = value:("'" non_single_quote_character* "'" / '"' non_double_quote_character* '"')
    {
        return value[1].join('');        
    }

non_single_quote_character
    = [^'\\]
    / slash:"\\" char:. { return slash + char; }

non_double_quote_character
    = [^"\\]
    / slash:"\\" char:. { return slash + char; }



/*** COMMON ***/

identifier
    = first:[a-zA-Z$_] rest:[a-zA-Z0-9_$]*
    {
        return first + rest.join('');
    }

params
    = first:param rest:(__ param_delimiter __ param)*
    {
        var params = [first];

        for (var i = 0; i < rest.length; ++i) {
            params.push(rest[i][3]);
        }

        return params;
    }

param
    = expression:expression
    {
        return expression;
    }

text
    = char:.
    {
        return {
            type: "text",
            value: char
        };
    }

_
    = whitespace

__
    = whitespace*

whitespace
    = [ \n\t\r]
