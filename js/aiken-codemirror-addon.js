(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd)
    define(["../../lib/codemirror"], mod);
  else
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

    CodeMirror.defineOption("aikenAutocomplete", false, function(cm, val, old) {
        cm.off("keyup", onKey);
        if(true == val){
            cm.on("keyup", onKey);
        }
    });

    function onKey(cm, event){
        if(true == cm.getOption("aikenAutocomplete")){
            if(event.key == "Enter"){
                let doc = cm.getDoc();
                let cursor = doc.getCursor();
                let lineBefore = doc.getLine(cursor.line-1);
                let typeObjectBefore = getType(lineBefore);
                let lineAfter = doc.getLine(cursor.line+1);
                let typeObjectAfter = getType(lineAfter);

                if(typeObjectBefore.type == TYPE_CORRECT){
                    if(!typeObjectAfter || typeObjectAfter.type != TYPE_QUESTION){
                        doc.replaceRange("\n", cursor);
                    }
                } else if (typeObjectBefore.type == TYPE_ANSWER) {
                    let newLetter = String.fromCharCode(typeObjectBefore.letter.charCodeAt(0) + 1);
                    if(newLetter != "Z") {
                        doc.replaceRange(newLetter + typeObjectBefore.sign + " ", cursor);
                    }
                    fixLettersBelow(cm, cursor.line, newLetter);
                } else if (typeObjectBefore.type == TYPE_QUESTION){
                    let sign = typeObjectAfter.sign || ".";  // "." can be replaced with ")"
                    if(typeObjectAfter.type == TYPE_ANSWER){
                        doc.replaceRange("A" + sign + " ", cursor);
                        cm.setCursor({line: cursor.line, ch: 3});
                    } else  {
                        doc.replaceRange("A" + sign + " \nANSWER: ", cursor);
                        cm.setCursor({line: cursor.line, ch: 3});
                    }
                    fixLettersBelow(cm, cursor.line, "A");
                }
            }
            if(event.key == "ArrowDown" || event.key == "ArrowUp"){
                let doc = cm.getDoc();
                let cursor = doc.getCursor();
                let lineText = doc.getLine(cursor.line);
                let typeObject = getType(lineText);
                if(typeObject.type == TYPE_CORRECT){
                    cm.setCursor({line: cursor.line, ch: cm.getLine(cursor.line).length});
                }
            }
        }
    }

    function fixLettersBelow(cm, lineNumber, startLetter){

        let doc = cm.getDoc();
        let line = doc.getLine(lineNumber);
        let lineType = getType(line);
        let currentLetter = lineType.letter;

        for(let i=1;i<100;i++){
            let currentLineNumber = lineNumber + i;
            let typeObject = getType(doc.getLine(currentLineNumber));
            if(typeObject.type == TYPE_ANSWER){
                currentLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
                doc.replaceRange(currentLetter, {line: currentLineNumber, ch: 0}, {line: currentLineNumber, ch: 1});
            } else if (typeObject.type == TYPE_CORRECT){
                let answerLetter = typeObject.letter;
                if(answerLetter && answerLetter.charCodeAt(0) >= startLetter.charCodeAt(0)){
                    answerLetter = String.fromCharCode(answerLetter.charCodeAt(0) + 1);
                    doc.replaceRange(answerLetter, {line: currentLineNumber, ch: 8}, {line: currentLineNumber, ch: 9});
                }
                break;
            } else {
                break;
            }
        }

    }
});
