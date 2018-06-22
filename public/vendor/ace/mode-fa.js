
ace.define('ace/mode/fa', function(require, exports, module){
"use strict";

var TextMode = require("./text").Mode;
var oop = require("../lib/oop");
var Range = require('../range').Range;
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var Mode = function(){

  this.HighlightRules = TextHighlightRules;

  this.getCompletions = function(editor, session, pos, prefix, callback){

    console.log(pos)
    var text = session.getTextRange(new Range(pos.row, 0, pos.row, pos.column))
    console.log(text);

    var tableName = Object.keys(fa_keyword).find(function(o){
      var lidx = text.lastIndexOf(o)
      if(lidx != -1){
        var idx = text.length - lidx- o.length;
        return idx == 0 || idx == 1;
      }
      return false;
    })

    if(tableName){
      return fa_keyword[tableName].map(function(word){
        return {
            name: word,
            value: word,
            score: 0,
            meta: tableName
        };
      })
    }

    return null;
  }
}
oop.inherits(Mode, TextMode);


(function() {
    this.$id = "ace/mode/fa"
}).call(Mode.prototype),

exports.Mode = Mode;

});
