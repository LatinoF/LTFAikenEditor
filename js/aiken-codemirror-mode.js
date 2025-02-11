// Immediately Invoked Function Expression (IIFE) to define a module
(function(mod) {
  // Check if the environment is CommonJS (Node.js)
  if (typeof exports == "object" && typeof module == "object") 
    // If so, require the necessary CodeMirror libraries
    mod(require("../../lib/codemirror"), require("../../addon/mode/simple"));
  // Check if the environment supports AMD (Asynchronous Module Definition)
  else if (typeof define == "function" && define.amd) 
    // If so, define the module with the required dependencies
    define(["../../lib/codemirror", "../../addon/mode/simple"], mod);
  // If neither CommonJS nor AMD, assume it's a plain browser environment
  else 
    // Call the module directly with the CodeMirror object
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict"; // Enable strict mode for better error checking

// Define a simple mode for CodeMirror named "aiken"
CodeMirror.defineSimpleMode("aiken", {
  // The start state contains the rules that are initially used
  start: [
    // Rule for matching answers
    {regex: AIKEN_REGEXP_ANSWER, token: ["comment", "operator", "variable-2"], sol: true},
    // Rule for matching correct answers
    {regex: AIKEN_REGEXP_CORRECT_ANSWER, token: ["number", null, "comment"], sol: true},
    // Rule for matching questions
    {regex: AIKEN_REGEXP_QUESTION, token: "atom", sol: true}
  ]
});

});
