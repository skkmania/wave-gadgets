//  dw.js
//   2010/01/14

DebugWindow = Class.create({
  initialize: function(game, title){
    this.game = game;
    this.dw_flag = false;
    this.dw_func_flag = true;
    this.dw_arg_flag = false;
    this.func_name_flag = false;
    this.func_msg_flag = false;
    this.debug_msg_flag = false;
    this.dw_All = true;
    this.debugWindow = window.open('', title, 'resizable,scrollbars,height=800,left=10,top=10,width=600');
    this.debugDoc = this.debugWindow.document;
    this.debugDoc.writeln('02');
//    var element = debugDoc.createElement('style');
//    element.appendChild(debugDoc.createTextNode(''));
//    debugDoc.getElementsByTagName('head')[0].appendChild(element);
//    var sheet = element.sheet;
    
    // 以下のように CSSStyleSheet の先頭に二つのルールを挿入していく
//    sheet.insertRule('html body { background: gray }', 0); // 0 番目にこのルールを挿入
//    sheet.insertRule('html body { background: red }', 0);  // 0 番目にこのルールを挿入
    this.debugDoc.writeln('01');
    this.addCss();
    this.debugDoc.writeln('02');
    this.debugIndent = 0;
    this.holdedSign = 'start';
    this.write_header(title);
    return this;
  },

  addCss : function addCss(){
  },

  write_header : function write_header(title){
    this.debugDoc.writeln('<title>' + title + '</title>');
    this.debugDoc.writeln('<link rel="stylesheet" type="text/css" href="dw.css" media="screen,projection,tv" />');
    for ( key in this.css ){
    this.debugDoc.writeln(key);
    this.debugDoc.writeln(this.css[key]);
    }
    this.debugDoc.writeln('');
  },

  dump_list : function dump_list(obj){
    var ret = '<div class="dump_list">';
    ret += '<table>';
    for (key in obj){
      ret += '<tr>';
      ret += ('<td>' + key + '</td>'); 
      ret += ('<td>' + obj[key] + '</td>'); 
      ret += '</tr>';
    }
    ret += '</table></div>';
    this.debugDoc.writeln(ret);
  },

  dw : function dw(str){
         var d = new Date();
         var ts = d.toLocaleTimeString();
         if (this.dw_flag | this.dw_All){
           if (arguments.length == 1){
             this.debugDoc.writeln(ts + '---' + str + '<br/>');
             //this.debugDoc.writeln(Date.toTimeString() + '---' + str + '<br/>');
           } else {
             var level = arguments[1]
             this.debugDoc.writeln(ts + '---' + '<span class="level' + level + '">' + str + '</span><br/>');
             //this.debugDoc.writeln(Date.toTimeString() + '---' + '<span class="level' + level + '">' + str + '</span><br/>');
           }
           this.debugWindow.scrollBy(0,30 + str.length/100);
         }
        },

  dw_value : function dw_value(obj, level){
         if (this.dw_flag | this.dw_All){
           var str = '';
           for (key in obj){
             str += (' ' + obj[key] + ',');
           }
           if (arguments.length == 1){
             this.debugDoc.writeln(str + '<br/>');
           } else {
             this.debugDoc.writeln('<span class="level' + level + '">' + str + '</span><br/>');
           }
           this.debugWindow.scrollBy(0,30 + str.length/100);
         }
        },

  func_name : function func_name(sign){
        if (this.func_name_flag | this.dw_All){
          var func_str = arguments.callee.caller.toString();
          var result = func_str.match(/function *(\w+) *\(.*/);
          var func_name = result[1];
          if (sign == 'start'){
            this.debugDoc.writeln('<span class="func_name_start">' + func_name + ' started.</span><br/>');
          } else {
            this.debugDoc.writeln('<span class="func_name_end">' + func_name + ' ended.</span><br/>');
          }
          this.debugWindow.scrollBy(0,30);
        }
      },

  func_msg : function func_msg(obj, flag){
        if (this.func_msg_flag | this.dw_All){
          var func_str = arguments.callee.caller.toString();
          for (prop in obj){
            if(obj[prop] == arguments.callee.caller){
      	dw(prop + ' : ' + flag , 3);
      	break;
            }
          }
          this.debugWindow.scrollBy(0,30);
        }
      },

  dw_func : function dw_func(sign){
       if (this.dw_func_flag | this.dw_All){
         if (sign == 'start'){
           if (holdedSign == 'start') debugIndent++;
           var indent = '';
           for (var i = 0; i < 3*debugIndent; i++) indent += '-';
           this.debugDoc.write(indent);
           this.debugDoc.writeln('<span class="func_name_start">' + arguments.callee.caller.name + ' started.</span><br/>');
           holdedSign = 'start';
         } else {
           if (holdedSign == 'end') debugIndent--;
           var indent = '';
           for (var i = 0; i < 3*debugIndent; i++) indent += '-';
           this.debugDoc.write(indent);
           this.debugDoc.writeln('<span class="func_name_end">' + arguments.callee.caller.name + ' ended.</span><br/>');
           holdedSign = 'end';
         }
         this.debugWindow.scrollBy(0,30);
       }
     },

  debug_msg : function debug_msg(name,sign){
       if (this.debug_msg_flag | this.dw_All){
         if (sign == 'start'){
           if (holdedSign == 'start') debugIndent++;
           var indent = '';
           for (var i = 0; i < 3*debugIndent; i++) indent += '-';
           this.debugDoc.write(indent);
           this.debugDoc.writeln('<span class="func_name_start">' + name + ' started.</span><br/>');
           holdedSign = 'start';
         } else {
           if (holdedSign == 'end') debugIndent--;
           var indent = '';
           for (var i = 0; i < 3*debugIndent; i++) indent += '-';
           this.debugDoc.write(indent);
           this.debugDoc.writeln('<span class="func_name_end">' + name + ' ended.</span><br/>');
           holdedSign = 'end';
         }
       }
     },

  dw_arg : function dw_arg(arg){
      if(this.dw_arg_flag | this.dw_All){
        for(var i = 0; i < arg.length; i++)
          this.debugDoc.writeln('<span class="dw_arg">arguments : ' + Object.toJSON(arg[i]) + '</span><br/>');
        this.debugWindow.scrollBy(0,30);
      }
    }
});
