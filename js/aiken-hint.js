const AIKEN_REGEXP_QUESTION = /^.+$/
const AIKEN_REGEXP_ANSWER = /^([A-Z])(\.|\))( .*)$/;
const AIKEN_REGEXP_CORRECT_ANSWER = /^(ANSWER:)( )([A-Z])$/;

const REGEXP_LIKE_CORRECT_ANSWER = /^(answer)([: ]{0,2})(([a-zA-Z])?.*)$/i;
const REGEXP_LIKE_ANSWER = /^( *)([A-Z])(\.|\))( )?(.*)$/i;

const TYPE_QUESTION = 'q';
const TYPE_ANSWER = 'a';
const TYPE_CORRECT = 'c';
const TYPE_EMPTY = 'e';

AIKENPARSER = function(text){

    var errors = [];
    var returnObject = {errors:errors};

    var lines = text.split("\n");
    var lineTypes = parseTypes(lines);

    if(lines.length >= 2 && lines[0] == ""){
        errors.push(new AikenHint().fromLine(0).fromColumn(0).toLine(0).toColumn(1).severity("error").message("error.first-line-empty").build());
    }

    for(let i=1;i<lineTypes.length;i++){
        if(TYPE_QUESTION == lineTypes[i].type && TYPE_QUESTION == lineTypes[i-1].type){
            errors.push(new AikenHint().fromLine(i).fromColumn(0).toLine(i).toColumn(lines[i].length).severity("error").message("error.question-must-be-in-one-line").build());
        }
    }

    for(let i=1; i<lineTypes.length;i++){
        if(TYPE_CORRECT == lineTypes[i].type && TYPE_QUESTION == lineTypes[i-1].type){
            errors.push(new AikenHint().fromLine(i-1).fromColumn(0).toLine(i-1).toColumn(lines[i-1].length).severity("error").message("error.question-without-answers").build());
        }
    }

    for(let i=1; i < lineTypes.length-1; i++){
        if(TYPE_ANSWER == lineTypes[i].type && TYPE_QUESTION == lineTypes[i-1].type && TYPE_CORRECT == lineTypes[i+1].type){
            errors.push(new AikenHint().fromLine(i-1).fromColumn(0).toLine(i-1).toColumn(lines[i-1].length).severity("error").message("error.question-with-only-one-answer").build());
        }

    }

    for(let i=1; i < lineTypes.length; i++){
        if(TYPE_EMPTY == lineTypes[i].type && TYPE_ANSWER == lineTypes[i-1].type){
            errors.push(new AikenHint().fromLine(i).fromColumn(0).toLine(i).toColumn(0).severity("error").message("error.question-without-correct-answer").build());
        }
    }

    for(let i=0; i<lineTypes.length; i++){
        if(TYPE_CORRECT == lineTypes[i].type){
            let letter = lineTypes[i].letter;
            if(letter){
                let finded = false;
                //look up
                for(let j = i-1; j>=0; j--){
                    if(lineTypes[j].type != TYPE_ANSWER){
                        break;
                    }
                    if(letter == lineTypes[j].letter){
                        finded = true;
                    }
                }
                if(!finded){
                    errors.push(new AikenHint().fromLine(i).fromColumn(8).toLine(i).toColumn(9).severity("error").message("error.unknown-letter-in-correct-answer").build());
                }
            }
        }
    }

    if(TYPE_ANSWER == lineTypes[lineTypes.length-1].type){
        let line = findFirstLineOfMultilineQuestion(lineTypes, lineTypes.length-1);
        errors.push(new AikenHint().fromLine(line).fromColumn(0).toLine(line).toColumn(0).severity("warning").message("warning.correct-answer-not-defined").build());
    }

    if(TYPE_QUESTION == lineTypes[lineTypes.length-1].type){
        let line = findFirstLineOfMultilineQuestion(lineTypes, lineTypes.length-1);
        errors.push(new AikenHint().fromLine(line).fromColumn(0).toLine(line).toColumn(0).severity("warning").message("warning.question-without-any-answer").build());
    }

    for(let i=1; i<lineTypes.length; i++){
        if(TYPE_ANSWER == lineTypes[i].type && TYPE_ANSWER == lineTypes[i-1].type){
            let currentLetter = lineTypes[i].letter;
            let previousLetter = lineTypes[i-1].letter;
            if(! (currentLetter.charCodeAt(0) - 1 == previousLetter.charCodeAt(0))){
                errors.push(new AikenHint().fromLine(i).fromColumn(0).toLine(i).toColumn(1).severity("error").message("error.answers-identifiers-not-in-order").build());
            }
        }
        if(TYPE_ANSWER == lineTypes[i].type && TYPE_QUESTION == lineTypes[i-1].type && !(lineTypes[i].letter=='A') ){
            errors.push(new AikenHint().fromLine(i).fromColumn(0).toLine(i).toColumn(1).severity("error").message("error.first-answer-identifier-must-be-A").build());
        }
    }

    for(let i=1;i<lineTypes.length; i++){
        if(TYPE_EMPTY == lineTypes[i].type && TYPE_EMPTY == lineTypes[i-1].type){
            errors.push(new AikenHint().fromLine(i).fromColumn(0).toLine(i).toColumn(0).severity("error").message("error.more-than-one-empty-line-side-by-side").build());
        }
    }

    for(let i=1; i<lineTypes.length-1; i++){
        if(TYPE_EMPTY == lineTypes[i].type && !(TYPE_ANSWER == lineTypes[i-1].type || TYPE_EMPTY == lineTypes[i-1].type) && !(TYPE_QUESTION == lineTypes[i+1].type || TYPE_EMPTY == lineTypes[i+1].type)){
            errors.push(new AikenHint().fromLine(i).fromColumn(0).toLine(i).toColumn(0).severity("error").message("error.empty-line-not-allowed-inside-question").build());
        }
    }

    for(let i=1; i<lineTypes.length; i++){
        if(TYPE_QUESTION == lineTypes[i].type && (TYPE_CORRECT == lineTypes[i-1].type || TYPE_ANSWER == lineTypes[i-1].type)){
            errors.push(new AikenHint().fromLine(i).fromColumn(0).toLine(i).toColumn(0).severity("error").message("error.no-empty-line-between-two-questions").build());
            if(TYPE_ANSWER == lineTypes[i-1].type){
                errors.push(new AikenHint().fromLine(i-1).fromColumn(0).toLine(i-1).toColumn(0).severity("error").message("error.question-without-correct-answer").build());
            }
        }
    }

    for(let i=0;i<lineTypes.length; i++){
        if(TYPE_CORRECT == lineTypes[i].type){
            let tag = lines[i].match(REGEXP_LIKE_CORRECT_ANSWER);
            if(tag[1] != "ANSWER"){
                errors.push(new AikenHint().fromLine(i).fromColumn(0).toLine(i).toColumn(5).severity("error").message("error.answer-must-be-uppercase").build());
            }
            if (tag[2].includes(":") && !tag[2].includes(" ")){
                errors.push(new AikenHint().fromLine(i).fromColumn(6).toLine(i).toColumn(7).severity("error").message("error.answer-must-contain-space").build());
            } else if (!tag[2].includes(":") && tag[2].includes(" ")){
                errors.push(new AikenHint().fromLine(i).fromColumn(6).toLine(i).toColumn(7).severity("error").message("error.answer-must-contain-colon").build());
            }
            if(tag[3] == ""){
                errors.push(new AikenHint().fromLine(i).fromColumn(0).toLine(i).toColumn(8).severity("error").message("error.correct-answer-not-defined").build());
            } else if(tag[3].length > 1 || (tag[3].length == 1 && !(/[A-Z]/.test(tag[3])))){
                errors.push(new AikenHint().fromLine(i).fromColumn(8).toLine(i).toColumn(8 + tag[3].length).severity("error").message("error.answer-must-be-exactly-one-uppercase-letter").build());
            }
        }
    }

    for(let i=0; i<lineTypes.length; i++){
        if(TYPE_ANSWER == lineTypes[i].type){
            let tag = lines[i].match(REGEXP_LIKE_ANSWER);
            if(tag[1] && tag[1].length > 0){
                errors.push(new AikenHint().fromLine(i).fromColumn(0).toLine(i).toColumn(tag[1].length).severity("error").message("error.answer-space-before-letter").build());
            }
            if(tag[2].toUpperCase() != tag[2]){
                errors.push(new AikenHint().fromLine(i).fromColumn(sumLengthUpToElement(tag, 1)).toLine(i).toColumn(sumLengthUpToElement(tag, 2)).severity("error").message("error.answer-letter-must-be-uppercase").build());
            }

            if(!tag[5] || !(tag[5].trim())){
                errors.push(new AikenHint().fromLine(i).fromColumn(0).toLine(i).toColumn(lines[i].length).severity("error").message("error.answer-cant-be-empty").build());
            } else if(!tag[4]){
                let position = sumLengthUpToElement(tag, 3);
                errors.push(new AikenHint().fromLine(i).fromColumn(position).toLine(i).toColumn(position+1).severity("error").message("error.answer-must-be-after-space").build());
            }
        }
    }

    return returnObject;
};

function sumLengthUpToElement(tag, to){
    let sum = 0;
    for(let i=1; i<= to; i++){
        sum += (tag[i] ? tag[i].length : 0);
    }
    return sum;
}

function findFirstLineOfMultilineQuestion(lineTypes, line){
        for(let j=line-1; j >=0; j--){
            if(TYPE_QUESTION == lineTypes[j].type){
                line = j;
            } else {
                break;
            }
        }
        return line;
}

function parseTypes(lines){
    var types = [];
    lines.forEach(function(line){
        types.push(getType(line));
    });
    return types;
}

function getType(line){
    if("" == line || line == null){
        return {
            type: TYPE_EMPTY
        }
    }

    if(REGEXP_LIKE_CORRECT_ANSWER.test(line)){
        let tag = line.match(REGEXP_LIKE_CORRECT_ANSWER);
        return {
            type: TYPE_CORRECT,
            letter: tag[4]
        }
    }

    if(REGEXP_LIKE_ANSWER.test(line)){
        let tag = line.match(REGEXP_LIKE_ANSWER);
        return{
            type: TYPE_ANSWER,
            letter: tag[2].toUpperCase(),
            sign: tag[3]
        }
    }

    if (AIKEN_REGEXP_QUESTION.test(line)){
        let tag = line.match(AIKEN_REGEXP_QUESTION);
        return {
            type: TYPE_QUESTION
        }
    }

}

AikenHint = function(){
    this.fromLine = function(value){
        this._fromLine = value;
        return this;
    };
    this.fromColumn = function(value){
        this._fromColumn = value;
        return this;
    };
    this.toLine = function(value){
        this._toLine = value;
        return this;
    };
    this.toColumn = function(value){
        this._toColumn = value;
        return this;
    };
    this.severity = function(value){
        if(value != "error" && value != "warning"){
            throw "Value " + value + " not allowed. Only 'error' and 'warning'.";
        }
        this._severity = value;
        return this;
    }
    this.message = function(value){
        this._message = value;
        return this;
    }
    this.build = function(){
        return{
            fromLine: this._fromLine,
            fromColumn: this._fromColumn,
            toLine: this._toLine,
            toColumn: this._toColumn,
            severity: this._severity,
            message: this._message
        };
    }
}

// poprawmy IE
if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    'use strict';
    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}