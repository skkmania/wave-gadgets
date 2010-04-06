/**
 * log4pipe.js : prototype.jsを使用したWebアプリのトレースログを得るためのツール
 *      2010.3.3 : log4js.jsを元手に作成した。
 */

var window_factory = function(container,title,options){
   var window_header = new Element('div',{
      className: 'window_header'
   });
   var window_title = new Element('div',{
      className: 'window_title'
   });
   var window_close = new Element('div',{
      className: 'window_close'
   });
   var window_resizable = new Element('div',{
      className: 'window_resizable'
   });
   var window_contents = new Element('div',{
      className: 'window_contents'
   });
   var w = new Control.Window(container,Object.extend({
      className: 'window',
      closeOnClick: window_close,
      draggable: window_header,
      resizable: window_resizable,
      insertRemoteContentAt: window_contents,
      afterOpen: function(){
         window_title.update(title)
      }
   },options || {}));
   w.container.insert(window_header);
   window_header.insert(window_title);
   window_header.insert(window_close);
   //window_header.insert(window_resizable);
   w.container.insert(window_resizable);
   w.container.insert(window_contents);
   w.contents = window_contents;
   w.contents.id = title;
   return w;
};
Log = Class.create({
  initialize: function(level, logger, options){
       this.defaultOptions();
       this.currentLevel = level || Log.WARN;
       switch(logger){
       case 'write':
         this.logger = this.write; // default to write Logger
         break;
       case 'alert':
         this.logger = this.alert; // default to write Logger
         break;
       case 'console':
         this.logger = this.console;
         break;
       case 'popup':
         var title = (options && options['title'])? options['title'] : 'popupLogger';
         this.popupInitialize(title, options);
         this.goOut = this.goOut;
         this.getInto = this.getInto;
         this.logger = this.entry;
         break;
       default:
         this.logger = this.write; // default to write Logger
       // logger:function that will be called when a log event needs to be displayed
       }
       options ? this.mergeOptions(options) : this.defaultOptions();
       this.prefix = this.options['prefix'] || false;
         // {String} prefix  will be prepended to all messages.
       this.levels = $w('dummy debug3 debug2 debug1 debug info warn error fatal none');
       this.levels.each(function(lvl, idx){
         this[lvl] = function(str, opt){
           if(this.currentLevel <= idx) this._log(str, idx, opt); };
       }.bind(this));
       this.debug = this['debug'];
  },
      /**
       * _log : function that actually calling the configured logger function.
       * It is possible that this function could be extended to allow for more
       * than one logger.
       * 
       * This method is used by debug}, info}, warn}, error}, and fatal}
       */
  _log: function _log(msg,level,opt) { 
         // msg   :string: The message to display
         // level :number: The priority level of this log event
         // opt   :object: The options object.
	if (this.prefix) {
	  this.logger(this.prefix+" - "+msg,level,opt); 
	} else {
	  this.logger(msg, level, opt); 
	}
  },

  setLevel: function setLevel(level) { 
       /**
        * Sets the current threshold log level for this Log instance.
        * Only events that have a priority of this level or greater are logged.
        * level: number or string:  The new threshold priority level for logging events.
               This can be one of the static members DEBUG3, DEBUG2, DEBUG1, DEBUG,  INFO, WARN, ERROR, FATAL, NONE,
               or it can be one of the strings ["debug3", "debug2", "debug1", "debug", "info", "warn", "error", "fatal", "none"].
        */
           if (level!='undefined' && typeof level =='number') {
               this.currentLevel = level;
           } else if (level!='undefined') {
               this.currentLevel = this.levels.indexOf(level);
           }
       },
  alert: function alert(msg,level) {
    alert(level+" - "+msg);
  },
  write: function write(msg,level) {
    document.writeln(level+"&nbsp;-&nbsp;"+msg+"<br/>");
  },
  console: function console(msg,level,obj) {
    if (window.console) {
      window.console.log(level+" - "+msg);
    } else {
      this.popup(msg,level,obj);
    }
  },
    /**
     * Safari WebKit console logger method.
     * This logger will write messages to the javascript console, if available.
     * If this browser doesn't have a javascript console,
     * then it degrades gracefully to popup.
     */

  popupInitialize: function(title, options){
    this.window = null;
    this.title = title;
    if(options)  this.title = options['title'] || '';
    this.divStack = [];
    this.openWindow(options);
    this.createTopDiv(title);
  },
  openWindow: function openWindow(options){
     var container = options && options['container'] ? $(options['container']) : $('popup_logger');
     if (!this.window || !this.window.document) {
       this.window = window_factory(container, this.title, options);
       if (!this.window) {
         alert("Error : popup window not generated.");
         return;
       }
     }
  },
  createTopDiv: function createTopDiv(title){
    this.top = $(title + 'topDiv');
    if (!this.top) {
      this.top = new Element('div');
      this.top.id = title + 'topDiv';
      this.top.className = 'loggerDiv';
    }
    this.top.style.width='100%';
    var topLine = new Element('div');
    topLine.className = "logRow";
    var topLine_1 = new Element('div');
    topLine_1.className = "logCell_1";
    topLine_1.innerHTML = 'Time';
    var topLine_2 = new Element('div');
    topLine_2.className = "logCell_3";
    topLine_2.innerHTML = 'Message';
    topLine.appendChild(topLine_1);
    topLine.appendChild(topLine_2);
    this.top.appendChild(topLine);
//    $$('.window .window_contents')[0].insert(this.top);
    //this.window.contents.insert(this.top);
    this.window.contents.appendChild(this.top);
    this.divStack.push(this.top);
  },
  currentDiv: function currentDiv(){
    return this.divStack[this.divStack.length - 1];
  },
  insertRowDiv: function insertRowDiv(){
    var ret = new Element('div');
    ret.className = 'logRow';
    this.currentDiv().appendChild(ret);
    return ret;
  },
  createTimeStamp: function createTimeStamp(option){
    // option : 'datetime' -> return date + time
    //          'date'     -> return date
    //          'time'     -> return time
    var d = new Date();
    var h = d.getHours();
    if (h<10) { h="0"+h; }
    var m = d.getMinutes();
    if (m<10) { m="0"+m; }
    var s = d.getSeconds();
    if (s<10) { s="0"+s; }

    var date = (d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear();
    var delimiter = "&nbsp;-&nbsp;";
    var time = h+":"+m+":"+s;

    if(option['datetime']){
        return  date + delimiter + time;
    } else if(option['date']){
        return  date;
    } else if(option['time']){
        return time;
    } else
        return '';
  },

  getInto: function getInto() {
    var ret = new Element('div');
    ret.className = 'logDiv';
    var firstLine = new Element('div');
    firstLine.className = 'logDivFirstLine';
    firstLine.innerHTML = arguments.callee.caller.name;
    ret.folded = false;
    ret.appendChild(firstLine);
    this.addFoldButton(firstLine);
    var parent = this.currentDiv();
    if(parent)
      parent.appendChild(ret);
    else
      this.window.document.getElementById('loggerDiv').appendChild(ret);
    this.divStack.push(ret);
    ret.style.background = this.getCurrentDivColor();
    return ret;
  },

  addFoldButton: function addFoldButton(div) {
    var button = new Element('span', { 'className':'foldbutton' });
    button.div = div.up(); 
    button.innerHTML = 'fold';
    button.onclick = this.fold(div.up());
    div.appendChild(button);
  },

  fold: function fold(div) {
    return function() {
       var tail = div.descendants();
       tail.shift(); tail.shift();
       div.folded ? tail.invoke('show') : tail.invoke('hide');
       div.folded = !(div.folded);
    };
  },

  goOut: function goOut(){
    this.divStack.pop();
  },

  insertCellDiv: function insertCellDiv(rowDiv, className){
    var ret = new Element('div');
    ret.className = className;
    rowDiv.appendChild(ret);
    return ret;
  },

  entry: function entry(msg, level, option){
    // msg : string, log message
    // level: number, such as Log.FATAL, Log.ERROR, Log.WARN,...
    // option: object, mainly used for css style setting
    //var opt = option || this.options;
    var opt = this.options;
    var row = this.insertRowDiv();
    var cell_1 = this.insertCellDiv(row, 'logCell_1');
    if(opt['level']){
      var cell_2 = this.insertCellDiv(row, 'logCell_2');
      cell_2.innerHTML= this.levels[level].toUpperCase();
    }
    var cell_3 = this.insertCellDiv(row, 'logCell_3');

    cell_1.innerHTML= this.createTimeStamp(opt);
    cell_3.innerHTML= msg;

    for (key in opt){
      if(key == 1) this.setStyle(cell_1, opt[key]);
      if(cell_2 && key == 2) this.setStyle(cell_2, opt[key]);
      if(key == 3) this.setStyle(cell_3, opt[key]);
    }
  },

  setStyle: function setStyle(cell, opt) {
    for (key in opt){
      cell.style[key] = opt[key];
    }
  },

  getCurrentDivColor: function() {
    var delta = this.divStack.length;
    var single = (255 - 10*delta).toString(16);
    return '#' + single + single + single;
  },

  mergeOptions: function mergeOptions(opt) {
    this.defaultOptions();
    for (key in opt){
      this.options[key] = opt[key];
    }
  },

  defaultOptions: function defaultOptions() {
    this.options = { 'time' : true,
                     'level': false,
                     1: { 'font-size' : '8px' },
                     3: { 'font-size' : '10px' }
                   };
  }

});

Log.DEBUG3      = 1;
Log.DEBUG2      = 2;
Log.DEBUG1      = 3;
Log.DEBUG       = 4;
Log.INFO        = 5;
Log.WARN        = 6;
Log.ERROR       = 7;
Log.FATAL       = 8;
Log.NONE        = 9;

/**
 * This method is a utility function that takes an object and creates a string representation of it's members.
 * @param {Object} the Object that you'd like to see
 * @return {String} a String representation of the object passed
 */
Log.dumpObject=function (obj,indent) {
	if (!indent) { indent="";}
	if (indent.length>20) { return ; } // don't go too far...
	var s="{\n";
		for (var p in obj) {
			s+=indent+p+":";
			var type=typeof(obj[p]);
			type=type.toLowerCase();
			if (type=='object') {
				s+= Log.dumpObject(obj[p],indent+"----");
			} else {
				s+= obj[p];
			}
			s+="\n";
		}
		s+=indent+"}";
		return s;
}
