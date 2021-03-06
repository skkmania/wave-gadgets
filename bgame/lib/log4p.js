/**
 * log4p.js : prototype.jsを使用したWebアプリのトレースログを得るためのツール
 *      2010.3.3 : log4js.jsを元手に作成した。
 */

Log = Class.create({
  initialize: function(level, logger, options){

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
         this.title = (options && options['title'])? options['title'] : 'popupLogger';
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
    this.popupBlocker = false;
    this.host = options['host'] || '';
    this.window = null;
    this.title = title || options['title'] || '';
    this.windowFeature = ''; // 'resizable,scrollbars=yes,status=yes';
    this.divStack = [];
    if (this.popupBlocker) {
      alert('log window popup blocked.');
      return;
    }
    this.openWindow();
    this.createTopDiv();
    // this.setCSSfile('./log4p.css');
  },
  openWindow: function openWindow(){
    if (!this.window || !this.window.document) {
      this.window = window.open("","_blank",this.windowFeature);
      //this.window = window.open("",this.title,this.windowFeature);
      if (!this.window) {
        this.popupBlocker=true;
        alert("popup window blocked.");
        return;
      }
    }
      var html = new Element('html');
      var new_head = new Element('head');
      var new_body = new Element('body');
      //var old_head = this.window.document.getElementsByTagName('head')[0];
      //var old_body = this.window.document.getElementsByTagName('body')[0];
      //this.window.document.removeChild(old_head );
      this.window.document.open();
/*
      //this.window.document.appendChild(html);
      this.window.document.appendChild(new_head);
      this.window.document.appendChild(new_body);
      //this.window.document.replaceChild(new_head, old_head );
*/      

    var titleDiv = new Element('text').update(this.title);
    //this.window.document.body.appendChild(titleDiv);
    new_body.appendChild(titleDiv);
    var sampleDiv = new Element('div').update('this div was created by Prototype.js method.');
    new_body.appendChild(sampleDiv);
    sampleDiv.addClassName('sampleDiv');
/*
    var originalDiv = this.window.document.createElement('div');
    originalDiv.innerHTML = 'this div was created by normal javascript';
    sampleDiv.appendChild(originalDiv);
    //this.window.document.body.appendChild(originalDiv);
    // 次の行はダメ。なぜなら、prototypeのメソッドを持たない要素だから。
    // originalDiv.addClassName('originalDiv');
    Element.addClassName(originalDiv, 'originalDiv');
*/    
    this.window.document.close();
  },
  addPrototype: function addPrototype() {
    var header = this.window.document.getElementsByTagName('head')[0];
    var script = this.window.document.createElement('script');
    script.src = this.host + 'prototype.js';
    header.appendChild(script);
  },

  hasCSSfile: function hasCSSfile(filename) {
    var header = this.window.document.getElementsByTagName('head')[0];
    return Selector.findChildElements(this.window.document.body,'div').size() > 0;
    //return Selector.findChildElements(header,'[href="' + filename + '"]').size() > 0;
  },

  setCSSfile: function setCSSfile(filename) {

    var header = this.window.document.getElementsByTagName('head')[0];
/*
    var link = this.window.document.createElement('link');
    link.href = filename;
    link.type = "text/css";
    link.rel = "stylesheet";
*/
    var link = new Element('link',{'href':filename, 'type':'text/css','rel':'stylesheet'});
    header.appendChild(link);

    var search_result = 'appended';
    //if(Selector.findChildElements(header,'[href="' + filename + '"]').size() > 0){
    //this.window.document.$$('link').pluck('href').each(function(s){ alert(s); });
    //Object.extend(header, titleDiv);
    //header.childElements().pluck('href').each(function(s){ alert(s); });
    /*
    if( this.window.document.$$('link').pluck('href').include(filename) ){
        search_result = 'already exists';
    }
    */
    /*
    if (search_result != 'already exists'){
      var link = new this.window.Element('link',{'href':filename, 'type':'text/css','rel':'stylesheet'});
      header.appendChild(link);
    }
    */
    return search_result;
  },

  createTopDiv: function createTopDiv(){
    this.topDiv = this.window.document.getElementById('loggerDiv');
    if (!this.topDiv) {
      this.topDiv = this.window.document.createElement('div');
      this.topDiv.id = 'loggerDiv';
    }
    this.topDiv.style.width='100%';
    var title = this.window.document.createElement('div');
    title.className = "logRow";
    var title_1 = this.window.document.createElement('div');
    title_1.className = "logCell";
    title_1.innerHTML = 'Time';
    var title_2 = this.window.document.createElement('div');
    title_2.className = "logCell";
    title_2.innerHTML = 'Message';
    title.appendChild(title_1);
    title.appendChild(title_2);
    this.topDiv.appendChild(title);
    this.window.document.body.appendChild(this.topDiv);
    this.window.document.close();
    this.divStack.push(this.topDiv);
  },
  currentDiv: function currentDiv(){
    var ret = this.divStack[this.divStack.length - 1];
    return ret ? ret : this.topDiv;
  },
  insertRowDiv: function insertRowDiv(){
    var ret = this.window.document.createElement('div');
    ret.className = 'logRow';
    if(this.currentDiv()) this.currentDiv().appendChild(ret);
    else this.topDiv.appendChild(ret);
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

  getInto: function getInto(opt) {
    //var ret = this.window.document.createElement('div');
    //ret.className = 'logDiv';
    var ret = new Element('div',{'class':'logDiv'});
    var parent = this.currentDiv();
    if(parent)
      parent.appendChild(ret);
    else
      //this.window.document.getElementById('loggerDiv').appendChild(ret);
      $('loggerDiv').appendChild(ret);
    this.divStack.push(ret);
    ret.style.background = this.getCurrentDivColor();
    if(opt){
      for (key in opt){
        ret.style[key] = opt[key];
      }
    }
    var row = new Element('div',{'class':'logRow'});
    row.update(arguments.callee.caller.name + ' entered.');
    Element.update(ret, row);
    return ret;
  },

  goOut: function goOut(){
    this.divStack.pop();
  },

  insertCellDiv: function insertCellDiv(rowDiv, className){
    var ret = this.window.document.createElement('div');
    ret.className = className;
    rowDiv.appendChild(ret);
    return ret;
  },

  entry: function entry(msg, level, option){
    // msg : string, log message
    // level: number, such as Log.FATAL, Log.ERROR, Log.WARN,...
    // option: object, mainly used for css style setting
    var opt = option || this.options;
    var row = this.insertRowDiv();
    if (typeof msg == 'object') msg = Log.dumpObject(msg);
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
