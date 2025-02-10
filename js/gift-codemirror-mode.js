(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"), require("../../addon/mode/simple"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror", "../../addon/mode/simple"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineSimpleMode("gift", {
  // The start state contains the rules that are intially used
  start: [
	// komentarz
	{regex: GIFT_REGEXP_COMMENT, 	token: ["comment"], sol:true},
	{regex: /^(::.*?::)(.*)(\{)(.*)(\})(.*)$/, token: ["header", "atom", "string-2", "atom", "string-2", "atom"], sol:true},
//	// poprawna odpowiedz
//	{regex: AIKEN_REGEXP_CORRECT_ANSWER, 	token: ["number", null, "comment"], sol:true},
//	// pytanie - do poprawy?
//	{regex: AIKEN_REGEXP_QUESTION, 				token: "atom", sol:true}

    {regex: /^(string)$/, token: "string"},
    {regex: /^(string-2)$/, token: "string-2"},
    {regex: /^(header)$/, token: "header"},
    {regex: /^(quote)$/, token: "quote"},
    {regex: /^(negative)$/, token: "negative"},
    {regex: /^(positive)$/, token: "positive"},
    {regex: /^(link)$/, token: "link"},
    {regex: /^(strikethrough)$/, token: "strikethrough"},
    {regex: /^(def)$/, token: "def"},
    {regex: /^(punctuation)$/, token: "punctuation"},
    {regex: /^(property)$/, token: "property"},
    {regex: /^(operator)$/, token: "operator"},
    {regex: /^(atom)$/, token: "atom"},
    {regex: /^(meta)$/, token: "meta"},
    {regex: /^(qualifier)$/, token: "qualifier"},
    {regex: /^(builtin)$/, token: "builtin"},
    {regex: /^(bracket)$/, token: "bracket"},
    {regex: /^(tag)$/, token: "tag"},
    {regex: /^(attribute)$/, token: "attribute"},
    {regex: /^(hr)$/, token: "hr"},
    {regex: /^(number)$/, token: "number"},
    {regex: /^(keyword)$/, token: "keyword"},
    {regex: /^(variable2)$/, token: "variable-2"},
    {regex: /^(variable3)$/, token: "variable-3"},
    {regex: /^(variable)$/, token: "variable"},
    {regex: /^(comment)$/, token: "comment"},
    {regex: /^(error)$/, token: "error"},
    {regex: /^(invalidchar)$/, token: "invalidchar"},

  ],
  comment: [
   {regex: /.*?\*\//, token: "comment", next: "start"},
   {regex: /.*/, token: "comment"}
  ],
 // The meta property contains global information about the mode. It
 // can contain properties like lineComment, which are supported by
 // all modes, and also directives like dontIndentStates, which are
 // specific to simple modes.
 meta: {
   dontIndentStates: ["comment"],
   lineComment: "//"
 }
});

});