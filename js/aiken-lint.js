(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.registerHelper("lint", "aiken", function(text) {
  var found = [];
  var errors = AIKENPARSER(text).errors;
    AIKENPARSER(text).errors.forEach( function(error){
        found.push({from: CodeMirror.Pos(error.fromLine, error.fromColumn),
                to: CodeMirror.Pos(error.toLine, error.toColumn),
                severity: error.severity ? error.severity : "error",
                message: translate(error.message)});
    });


  return found;
});

function translate(key){
    try{
        return i18next.t(key);
    } catch(ex){
        console.log(ex);
        return key;
    }
}

});
