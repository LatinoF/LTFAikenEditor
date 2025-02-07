(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"), require("../../addon/mode/simple"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror", "../../addon/mode/simple"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineSimpleMode("aiken", {
  // The start state contains the rules that are intially used
  start: [
	// odpowiedz
	{regex: AIKEN_REGEXP_ANSWER, 	token: ["comment", "operator", "variable-2"], sol:true},
	// poprawna odpowiedz
	{regex: AIKEN_REGEXP_CORRECT_ANSWER, 	token: ["number", null, "comment"], sol:true},
	// pytanie - do poprawy?
	{regex: AIKEN_REGEXP_QUESTION, 				token: "atom", sol:true}

  ]
});

});