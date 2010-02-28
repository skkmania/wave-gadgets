HOST = 'http://skkmania.sakura.ne.jp/animal-shogi/';
LogIndent = 0;
DisplayLevel = false;
/**
 * common functions
 */
var Type2chr = { 'chick' : 'a', 'elephant' : 'b', 'giraffe' : 'c', 'lion' : 'd', 'chicken' : 'e' };
var Chr2Type = { 'a' : 'chick', 'b' : 'elephant', 'c' : 'giraffe', 'd' : 'lion', 'e' : 'chicken' };

Array.prototype.subtract = function(ary){
  // 配列から配列を引き算する。破壊的。
  $A(ary).each(function(c){
    var idx = $A(this).indexOf(c);
    if(idx >= 0) this.splice(idx,1);
  }.bind(this));
}

String.prototype.subtract = function(str){
  // 文字列から文字列を引き算する
  // 自分自身から与えられた文字列を引いた値を返す。
  // コピーを返すので元の値は変化しない
  var ret = $A(this);
  ret.subtract($A(str));
  return ret.join('');
}

function create_piece(chr){
  window.game.log.debug('entered create_piece: ' );
  var p = new Piece(chr);
  window.game.log.debug('leaving create_piece with :' + p.toDebugString() );
  return p;
}

function addDraggable(piece, startMessage){
  window.game.log.debug('entered addDraggable: ' + startMessage, {'indent':1});
      new Draggable(piece.elm, {
        onStart: function() {
          window.game.log.warn('Drag started. : ' + startMessage, {3:{'color':'#33AA88'}});
        },
        onEnd: function() {
          this.elm.style.top = 0;
          this.elm.style.left = 0;
        }.bind(piece)
      });
  window.game.log.debug('leaving addDraggable:', {'indent':-1});
}

function arrange(state){
  var str = state.toString();
  var pattern = /\w: '.*'\,/;
  var ret = str.replace(/\n/g, "<br>");
  return '<div style="color: #FF0000">' + ret + '</div>';
}

Number.prototype.toKanji = function(){
  var stock = ['','一','二','三', '四','五', '六','七', '八','九'];
  return stock[this];
}

/**
 * ControlPanel Class
 */
ControlPanel = Class.create({
	/**
	 * initialize(game)
	 */
  initialize: function(game) {
    this.game = game;
    if(this.game) this.game.log.warn('CP initialized.');
  },
	/**
	 * reverse()
	 */
  reverse: function() { // ControlPanel              
     this.game.log.debug('start reverse cp'); 
      if (this.game.top == 1){                                                
        this.player1Elm = $('top-panel');
        this.player2Elm = $('bottom-panel');
      } else {       
        this.player2Elm = $('top-panel');
        this.player1Elm = $('bottom-panel');
      }                    
    this.player1Elm.innerHTML = t('sente') + (this.game.player1 ? this.game.player1.statusHtml() : t('waiting'));
    this.player2Elm.innerHTML = t('gote') +  (this.game.player2 ? this.game.player2.statusHtml() : t('waiting'));
    this.game.log.debug('ControlPanel#reverse end'); 
  }, 
	/**
	 * update()
	 */
  update: function() { // ControlPanel             
    this.game.log.debug('cp update entered.'); 
    this.game.determineTop();
    this.game.log.debug('cp update : top is ' + this.game.top); 
    if (!this.elm) this.elm = $('control-panel');                         
    if (this.game.top == 1){                                                
      this.player1Elm = $('top-panel');
      this.player2Elm = $('bottom-panel');
    } else {       
      this.player2Elm = $('top-panel');
      this.player1Elm = $('bottom-panel');
    }                    
    this.player1Elm.innerHTML = t('sente') + (this.game.player1 ? this.game.player1.statusHtml() : t('waiting'));
    this.player2Elm.innerHTML = t('gote') +  (this.game.player2 ? this.game.player2.statusHtml() : t('waiting'));
     this.game.log.warn('cp update leaving'); 
  } 
});

/**
 * Piece Class
 */
Piece = Class.create({
	/**
	 * initialize(chr)
	 */
  initialize: function(chr, game) {
    this.game = game || window.game;
this.game.log.warn('Piece#initialize entered with : ' + chr, {'indent':1});
    this.type = Chr2Type[chr.toLowerCase()];
this.game.log.warn('Piece#initialize type is : ' + this.type);
    Object.extend(this, PieceTypeObjects[this.type]);
this.game.log.warn('Piece#initialize imageUrl is : ' + this.imageUrl);
    this.name = this.type + '_';
    this.name += ((chr.toLowerCase() == chr) ? 'player2' : 'player1');
this.game.log.warn('Piece#initialize name is : ' + this.name);
    this.cell = null;
    this.chr = chr;
    this.createElm();
this.game.log.warn('leaving Piece#initialize', {'indent':-1}); 
  },
	/**
	 * isBlack()
	 */
  isBlack: function() {  // Piece
this.game.log.debug('Piece#isBlack entered : ');
    var ret = (this.chr.toUpperCase() == this.chr);
this.game.log.debug('leaving Piece#isBlack with : ' + ret);
    return ret;
  },
	/**
	 * toggleBW()
	 */
  toggleBW: function() {  // Piece
    if (this.chr == this.chr.toUpperCase())
      this.chr = this.chr.toLowerCase(); 
    else
      this.chr = this.chr.toUpperCase(); 

    this.elm.toggleClassName('top');
    this.elm.toggleClassName('bottom');

  },
	/**
	 * createElm()
	 */
  createElm: function() {  // Piece
this.game.log.warn('Piece#createElm entered : ');
    this.elm = document.createElement('img');
    this.elm.obj = this;
    this.elm.src = this.imageUrl;
    this.elm.id = this.name;
    this.elm.addClassName('piece');
    if (!this.atTop()) {
      this.elm.addClassName('bottom');
    }
    else {
      this.elm.addClassName('top');
    }
this.game.log.warn('leaving Piece#createElm : ');
  },
	/**
	 * addDraggableIfNeeded()
	 */
  addDraggableIfNeeded: function(msg){ // Piece
this.game.log.warn('Piece#addDraggableIfNeeded entered : ' + msg, {'indent':1});
    if (!this.game.playingViewer) return;
    if(this.isBlack() == (this.game.top == 0))
      addDraggable(this, msg);
this.game.log.warn('leaving Piece#addDraggableIfNeeded  : ', {'indent':-1});
  },
	/**
	 * setClassName(player)
	 */
  setClassName: function() { // Piece
if (window.game) window.game.log.warn('piece setClassName entered: ' + this.name + ',  atTop : ' + this.atTop() + ',  this.elm.classname: ' + this.elm.className);
    if (!this.atTop()) {
      this.elm.addClassName('bottom');
      this.elm.removeClassName('top');
    }
    else {
      this.elm.removeClassName('bottom');
      this.elm.addClassName('top');
    }
if (window.game) window.game.log.warn('leaving piece setClassName : ' + this.name + ',  atTop : ' + this.atTop() + ',  this.elm.classname: ' + this.elm.className);
  },
	/**
	 * atTop()
	 */
  atTop: function(){ // Piece
    return (this.game.top == 1) == this.isBlack();
  },
	/**
	 * capturedBy(player) 
	 */
  capturedBy: function(player) { // Piece
window.game.log.warn('entered Piece.capturedBy: ' + this.name + ' is captured by ' + player.id);
    this.setClassName();
    this.cell.piece = null;
    this.cell = null;
    if (this.becomeNormal) this.becomeNormal();

    if (this.isViewersP()) {
      $('my-captured').appendChild(this.elm);
window.game.log.warn(this.elm.id + ' was appended to my-captured Piece#captured');
    }
    else {
      $('opponent-captured').appendChild(this.elm);
window.game.log.warn(this.elm.id + ' was appended to opponent-captured Piece#captured');
    }
  },
	/**
	 * canMove(fromObj, toCell)
	 */
  canMove: function(fromObj, toCell) { // Piece
window.game.log.warn('canMove entered.');
    if (fromObj.type == 'stand') return true; // 打ち駒はどこでもOK
    var dx = toCell.x - fromObj.x;
    var dy = toCell.y - fromObj.y;
window.game.log.warn('from: ' + fromObj.toDebugString() + ', to: ' + toCell.toDebugString());
window.game.log.warn('dx: ' + dx + ', dy: ' + dy);
    if (1 < Math.abs(dx) || 1 < Math.abs(dy)) return false;
    if (!this.isBlack()) dy *= -1;
window.game.log.warn('leaving with: ' + this.movableArea[dy + 1][dx + 1]);
    return this.movableArea[dy + 1][dx + 1];
  },
	/**
	 * move(fromCell, toCell, notCapture, dropOrState)
	 */
  move: function(fromCell, toCell, notCapture, dropOrState) {  // Piece
window.game.log.warn('Piece#move 1 : ');
    var capturedPiece = null;
    var movingPiece = null;
    if(fromCell) movingPiece = fromCell.removeOwnPiece();
window.game.log.warn('Piece#move 2 : ');
    capturedPiece = toCell.replaceOwnPieceWith(movingPiece);
window.game.log.warn('Piece#move 3 : ');
    return capturedPiece;
  },
	/**
	 * sitOnto(cell)
	 */
  sitOnto: function(distination_cell) { // Piece
window.game.log.debug('entered Piece#sitOnto : ' + distination_cell.toDebugString(), {'indent':1});
    if(this.cell) this.cell.elm.removeChild(this.elm);
    distination_cell.piece = this;
    distination_cell.elm.appendChild(this.elm);
    this.cell = distination_cell;
window.game.log.debug('leaving Piece#sitOnto as ' + this.toDebugString(), {'indent':-1});
  },
	/**
	 * gotoOpponentsStand()
	 */
  gotoOpponentsStand: function() { // Piece
window.game.log.debug('entered Piece#gotoOpponentsStand : ' + this.toDebugString(), {'indent':1});
    if(this.isBlack()){
window.game.log.debug('001');
      this.game.whiteStand.put(this);
window.game.log.debug('002');
    } else {
window.game.log.debug('101');
      this.game.blackStand.put(this);
window.game.log.debug('102');
    }
window.game.log.debug('leaving Piece#gotoOpponentsStand : ', {'indent':-1});
  },
	/**
	 * isViewersP()
	 */
  isViewersP: function(game) { // Piece
    if (this.isBlack())
      return this.game.player1.name == wave.getViewer().getId();
    else
      return this.game.player2.name == wave.getViewer().getId();
  },
	/**
	 * isGoal(cell)
	 */
  isGoal: function(cell) { // Piece
    return ( this.isBlack() ? (cell.y === 1) : (cell.y === 4) );
  },
	/**
	 * toDebugString()
	 */
  toDebugString: function() {  // Piece
    var ret = 'chr: <span style="color: #3F8080">' + this.chr + '</span>, ';
    ret += (', cn: ' + this.elm.className);
    if (this.cell && this.cell.elm) ret += ('cell_name:' + this.cell.elm.id);
    else ret += '[no cell]';
    ret += (', name: ' + this.name);
    return ret;
  }
});

/**
 * PieceTypeObjects 
 */
var PieceTypeObjects = {
	/**
	 * Lion
	 */
  'lion': {
  imageUrl: HOST + 'lion.png',
  type: 'lion',
  movableArea: [
    [ true,  true,  true],
    [ true, false,  true],
    [ true,  true,  true]
  ]
  },
	/**
	 * Elephant
	 */
  'elephant': {
  imageUrl: HOST + 'elephant.png',
  type: 'elephant',
  movableArea: [
    [ true, false,  true],
    [false, false, false],
    [ true, false,  true]
  ]
  },
	/**
	 * Giraffe
	 */
  'giraffe': {
  imageUrl: HOST + 'giraffe.png',
  type: 'giraffe',
  movableArea: [
    [false,  true, false],
    [ true, false,  true],
    [false,  true, false]
  ]
  },
	/**
	 * Chick
	 */
  'chick': {
  imageUrl: HOST + 'chick.png',
  type: 'chick',
  movableArea: [
    [false,  true, false],
    [false, false, false],
    [false, false, false]
  ]
  },
	/**
	 * Chicken
	 */
  'chicken': {
  imageUrl : HOST + 'chicken.png',
  type : 'chicken',
  movableArea : [
      [ true,  true,  true],
      [ true, false,  true],
      [false,  true, false]
    ]
  }
};

/**
 * Cell
 */
Cell = Class.create();
Cell.all = $A();
Cell.prototype = {
	/**
	 * initialize(board, x, y, top)
	 */
  initialize: function(board, x, y, top) {
    Cell.all.push(this);
    this.board = board;
    this.type = 'cell';
    this.game = this.board.game;
    this.x = x;
    this.y = y;
    this.top = top;
    this.marginTop = 0;
    this.marginLeft = 0;
    this.width = 40;
    this.hight = 42;
  },
	/**
	 * say()
	 */
  say: function(){ // Cell
    // このセルにいるpieceの状態を文字にして返す
    if (!this.piece) return 'x';
    var retChar = Type2chr[this.piece.type];
    if(this.piece.isBlack())
      return retChar.toUpperCase();
    else
      return retChar; 
  },
	/**
	 * put(piece)
	 */
  put: function(piece) { // Cell
this.game.log.warn('Cell#put entered');
    this.piece = piece;
    this.piece.cell = this;
    if(this.elm) this.elm.appendChild(piece.elm);
this.game.log.warn('Cell#put leaving with piece : ' + this.piece.toDebugString());
  },
	/**
	 * move(toY, toX)
	 */
  move: function(toY,toX){ // Cell
    this.elm.style.left = (this.marginLeft + this.width * toX) + 'px';
    this.elm.style.top = (this.marginTop + this.width * toY) + 'px';
  },
	/**
	 * getPosition()
	 */
  getPosition: function(){ // Cell
    // top値により、各セルの画面上の座標が決まる
if(this.x === 1 && this.y === 1) window.game.log.warn('-------Cell#getPosition -----------');
    if (window.game.top == 1){
      var bh = window.game.height;
      this.elm.style.left = (this.marginLeft + this.width * this.x) + 'px';
      this.elm.style.top = (this.marginTop + this.hight * (bh - 1 - this.y)) + 'px';
    } else {
      var bw = window.game.width;
      this.elm.style.left = (this.marginLeft + this.width * (bw - 1 - this.x)) + 'px';
      this.elm.style.top = (this.marginTop + this.hight * this.y) + 'px';
    }
  },
	/**
	 * createDummyElm()
	 */
  createDummyElm: function() {  // Cell
    this.elm = document.createElement('div');
    this.elm.id = 'dummyCell-' + this.x + '-' + this.y;
    this.elm.obj = this;
    this.elm.addClassName('dummyCell');
    this.getPosition();
    this.dummyPiece = document.createElement('div');
    if(this.x === 0 && this.y === 0){
      this.dummyPiece.id = 'cornerDummy';
      this.dummyPiece.innerHTML = '';
    } else {
      if(this.x === 0){
        this.dummyPiece.addClassName('rowNum');
        this.dummyPiece.innerHTML = this.y.toKanji();
      }
      if(this.y === 0){
        this.dummyPiece.addClassName('colNum');
        this.dummyPiece.innerHTML = this.x;
      }
    }
    this.elm.appendChild(this.dummyPiece);
    this.board.elm.appendChild(this.elm);
  },
	/**
	 * createElm()
	 */
  createElm: function() {  // Cell
    this.elm = document.createElement('div');
    this.elm.id = 'cell-' + this.x + '-' + this.y;
    this.elm.obj = this;
    this.elm.addClassName('cell');
    this.getPosition();
    this.board.elm.appendChild(this.elm);
window.game.log.warn('Droppables to add ' + this.elm.id);
    Droppables.add(this.elm, {
      accept: 'piece',
	/**
	 * onDrop(draggable)
	 */
      onDrop: function(draggable) {
        var fromObj = draggable.parentNode.obj;
window.game.log.warn('fromObj : <span style="color:#888800">' + fromObj.toDebugString() + '</span>');
        var toCell = this;
window.game.log.warn('<span style="color:#888800">onDrop called.</span>');
if(fromObj) window.game.log.debug('from: ' + fromObj.toDebugString());
if(toCell) window.game.log.debug(', to: ' + toCell.toDebugString());
        var piece = draggable.obj;

        if (!moveValidate(piece, fromObj, toCell)) return;
window.game.log.warn('canMove passed.');
        if (toCell.piece){
window.game.log.warn('piece moving and capturing. : ');
window.game.log.debug('draggable.obj is : ' + piece.toDebugString(),{'indent':1});
window.game.log.debug('toCell.piece is : ' + toCell.piece.toDebugString(),{'indent':-1});
          toCell.piece.gotoOpponentsStand();
        } else {
window.game.log.warn('piece moving without capturing.');
        }
        if(fromObj.type == 'cell'){
          fromObj.piece.sitOnto(toCell);
          fromObj.piece = null;
        } else if(fromObj.type == 'stand'){
          fromObj.removeByObj(piece);
          piece.sitOnto(toCell);
        }

        if (checkFinish(piece, toCell))
          window.game.finish(piece);
        else 
          window.game.nextTurn();
        sendDelta();
      }.bind(this)
    });
  },
	/**
	 * show()
	 */
  show: function() { // Cell
window.game.log.warn('entered show of Cell: ' + this.toDebugString(), {'indent':1});
    if (!this.elm) {
      (this.x === 0 || this.y === 0) ? this.createDummyElm() : this.createElm();
    }
    if (this.piece) {
window.game.log.warn('in show of Cell, processing -> ' + this.piece.toDebugString());
      this.elm.appendChild(this.piece.elm);
      if(this.piece.isBlack() == (window.game.top === 0)){
        this.piece.elm.addClassName('bottom');
        this.piece.elm.removeClassName('top');
        addDraggable(this.piece, 'draggable added at start of board');
      } else {
        this.piece.elm.addClassName('top');
        this.piece.elm.removeClassName('bottom');
      }
window.game.log.warn('in show of Cell, after process -> ' + this.piece.toDebugString());
    }
window.game.log.warn('leaving show of Cell: ' + this.toDebugString(), {'indent':-1});
  },
	/**
	 * isOpponentFirstLine(player)
	 */
  isOpponentFirstLine: function(player) {
    if (window.game.player1.id == player.id) {
      return this.y === 1;
    }
    else if (window.game.player2.id == player.id) {
      return this.y === 4;
    }
    else {
      throw 'not reach: ' + player.id;
    }
  },
	/*
	 * deleteOwnPiece()
	 */
  deleteOwnPiece: function(){  // Cell
window.game.log.debug('entered Cell#deleteOwnPiece');
if(this.piece)window.game.log.warn('this cell.piece to be deleted: ' + this.piece.toDebugString());
    if(this.piece){
      this.piece.cell = null;
      this.elm.removeChild(this.piece.elm);
      delete this.piece;
      this.piece = null;
    }
window.game.log.warn('leaving Cell#deleteOwnPiece as :' + this.toDebugString());
    return;
  }, 
	/**
	 * removeOwnPiece()
	 */
  removeOwnPiece: function(){  // Cell
window.game.log.debug('entered Cell#removeOwnPiece');
if(this.piece)window.game.log.warn('this cell.piece to be removed: ' + this.piece.toDebugString());
    var ret = null;
    if(this.piece){
      ret = this.piece;
      this.piece.cell = null;
      this.elm.removeChild(this.piece.elm);
      this.piece = null;
    }
window.game.log.warn('leaving Cell#removeOwnPiece as :' + this.toDebugString());
    return ret;
  },
	/**
	 * replaceOwnPieceWith(newPiece)
	 */
  replaceOwnPieceWith: function(newPiece){  // Cell
window.game.log.debug('entered Cell#replaceOwnPieceWith newPiece : ' + newPiece.toDebugString(), {'indent':1});
    var tmp = null;
    if(this.piece){
      tmp = this.piece;
      this.piece.gotoOpponentsStand();
      this.piece = null;
    }
    this.piece = newPiece;
    this.put(newPiece);
if (tmp){
  window.game.log.debug('leaving Cell#replaceOwnPieceWith with : ' + tmp.toDebugString(), {'indent':-1});
    return tmp;
} else {
window.game.log.debug('leaving Cell#replaceOwnPieceWith nothing', {'indent':-1});
    return;
}
  },
	/**
	 * captureBy(player)
	 */
  capturedBy: function(player) { // Cell
window.game.log.warn('entered Cell.capturedBy: player is ' + player.toDebugString());
    this.elm.removeChild(this.piece.elm);
    this.piece.capturedBy(player);
    this.piece = null;
  },
	/**
	 * toArray()
	 */
  toArray: function() {
    return [this.x, this.y];
  },
	/**
	 * toJSON()
	 */
  toJSON: function() {
    if (this.piece) {
      return this.piece.name;
    }
    else {
      return '';
    }
  },
	/**
	 * toDebugString()
	 */
  toDebugString: function(){  // Cell
    var ret = '';
    ret += '[' + this.x + ',' + this.y + ']';
    if(this.top) ret += ', top: ' + this.top;
    if(this.elm) ret += ', elm: ' + this.elm.id;
    if(this.piece) ret += ', piece: ' + this.piece.toDebugString();
    return ret;
  }
};

/**
 * Board
 */
Board = Class.create({
	/**
	 * initialize(elm, game)
	 */
  initialize: function(elm, game) {
    this.game = game;
    this.top = game.top;
    this.elm = elm || document.body;
    this.cells = [];
    for (var r = 0; r < this.game.height; r++) {
      var row = [];
      for (var c = 0; c < this.game.width; c++) {
        row.push(new Cell(this, c, r, this.game.top));
      }
      this.cells.push(row);
    }
    this.initialString = 'bxxCdaADcxxB';
    game.log.warn('Board#initialize 01');
    $A(this.initialString).each(function(chr, idx){
      if(chr == 'x') return;
      game.log.warn('idx: ' + idx);
      var xy = this.idx2xy(idx);
      var x = xy[0];
      var y = xy[1];
      game.log.warn('chr: ' + chr + ', x : ' + x +', y : ' + y);
if(this.cells[y] && this.cells[y][x])
  game.log.warn('cell: ' + this.cells[y][x].toDebugString());
else{
  game.log.warn('Board#initialize,  there is no cell at x: ' + x + ', y: ' + y +'.');
  return;
}
      var p = new Piece(chr, game);
      game.log.debug('piece: initialized in Board#initialize : ' + p.toDebugString());
      this.cells[y][x].put(p);
    }.bind(this));
    game.log.warn('leaving Board#initialize');
  },
	/**
	 * idx2xy(idx)
	 */
  idx2xy: function(idx) { // Board
    this.game.log.info('Board#idx2xy entered with : ' + idx);
    // stateの文字列のindex(0スタート）を座標の配列[x,y]にして返す
    var h = this.game.height - 1;
    var ret = [Math.floor(idx/h) + 1.0, idx%h + 1.0]
    this.game.log.info('Board#idx2xy returning with : ' + ret.toString());
    return ret;
  },
	/**
	 * xy2idx(xy)
	 */
  xy2idx: function(xy) {
    // 座標の配列[x,y]をstateの文字列のindex(0スタート）にして返す
    var h = this.game.height - 1;
    return (xy[0] - 1)*h + (xy[1]-1);
  },
	/**
	 * adjust()
	 */
  adjust: function() {
    if(!this.cells[1][1].elm) return;
    if(!this.game) return;
this.game.log.warn('-------board.adjust entered--top is ' + this.game.top + '  --------------------------------');
    this.cells.flatten().invoke('getPosition');
    this.adjustBorder();
this.game.log.warn('-------Board#adjust ended. -----------');
  },
	/**
	 * adjustBorder()
	 */
  adjustBorder: function() { // Board
this.game.log.warn('-------Board#adjustBoarder entered -----------');
    if(!this.cells[1][1].elm) return;
    if(!this.game) return;
    if(this.game.top === 0){
      for (var r = 1; r < this.game.height; r++) {
        this.cells[r][1].elm.addClassName('rightCell');
        this.cells[r][this.game.width - 1].elm.removeClassName('rightCell');
      }
      for (var c = 1; c < this.game.width; c++) {
        this.cells[1][c].elm.addClassName('topCell');
        this.cells[this.game.height - 1][c].elm.removeClassName('topCell');
      }
    } else {
      for (var r = 1; r < this.game.height; r++) {
        this.cells[r][this.game.width - 1].elm.addClassName('rightCell');
        this.cells[r][1].elm.removeClassName('rightCell');
      }
      for (var c = 1; c < this.game.width; c++) {
        this.cells[this.game.height - 1][c].elm.addClassName('topCell');
        this.cells[1][c].elm.removeClassName('topCell');
      }
    }
this.game.log.warn('------- Board#adjustBoarder leaving -----------');
  },
	/**
	 * show()
	 */
  show: function() {  // Board
    this.cells.flatten().invoke('show');
    this.adjustBorder();
  },
	/**
	 * getCell(x,y)
	 */
  getCell: function(x, y) {
    return this.cells[y][x];
  },
	/**
	 * getCellByIdx(idx)
	 */
  getCellByIdx: function(idx) {
    var xy = this.idx2xy(idx);
    return this.cells[xy[1]][xy[0]];
  },
	/**
	 * put(chr, idx)
	 */
  put: function(chr, idx){ // Board
    this.game.log.debug('entered Board#put with chr: ' + chr + ', idx : ' + idx, {'indent':1});
    var cell = this.getCellByIdx(idx);
    if(cell.piece){
      this.game.log.debug('Board#put: cell.piece existed : ' + cell.piece.toDebugString());
      if(cell.piece.chr == chr){
        // do nothing
      } else {
        cell.removeOwnPiece();
        var new_piece = create_piece(chr);
        new_piece.addDraggableIfNeeded('draggable added after read board 1');
        cell.put(new_piece);
      }
    } else {
      this.game.log.debug('Board#put: cell.piece not existed , so initialize piece and put ');
      var new_piece = create_piece(chr);
      this.game.log.debug('Board#put: new_piece was created : ' + new_piece.toDebugString());
      new_piece.addDraggableIfNeeded('draggable added after read board 2');
      this.game.log.debug('Board#put: putting new piece to : ' + cell.toDebugString());
      cell.put(new_piece);
    }
    this.game.log.debug('leaving Board#put',{'indent':-1});
  },
	/**
	 * deleteCellsPieceByIdx(idx)
	 */
  deleteCellsPieceByIdx: function(idx){ // Board
    this.game.log.debug('entered Board#deleteCellsPieceByIdx with idx : ' + idx, {'indent':1});
    var cell = this.getCellByIdx(idx);
    if(cell.piece){
      cell.deleteOwnPiece();
    } else {
      // do nothing
    }
    this.game.log.debug('leaving Board#deleteCellsPieceByIdx', {'indent':-1});
  },
	/**
	 * removeCellsPieceByIdx(idx)
	 */
  removeCellsPieceByIdx: function(idx){ // Board
    this.game.log.debug('entered Board#remove with idx : ' + idx, {'indent':1});
    var cell = this.getCellByIdx(idx);
    if(cell.piece){
      cell.removeOwnPiece();
    } else {
      // do nothing
    }
    this.game.log.debug('leaving Board#remove', {'indent':-1});
  },
	/**
	 * replace(pair, idx)
	 */
  replace: function(pair, idx){ // Board
    this.game.log.debug('entered Board#replace with pair: ' + pair.toString() + ', idx : ' + idx);
    var cell = this.getCellByIdx(idx);
    if(cell.piece){
      cell.replaceOwnPieceWith(new Piece(pair[0]));
    } else {
      cell.put(new Piece(pair[0]));
    }
  },
	/**
	 * read(strFromState)
	 */
  read: function(strFromState){ // Board
    this.game.log.debug('entered Board#read with : ' + strFromState);
    // stateから読んだ文字列を元に駒を盤上に置く
    // 現在の状態との差分を埋める
    var oldBoard = $A(this.toString());
    var newBoard = $A(strFromState);
    newBoard.zip(oldBoard).each(function(tuple, idx){
        if(tuple[0] != tuple[1]){
           if(tuple[1] == 'x') this.put(tuple[0], idx);
           else if(tuple[0] == 'x') this.deleteCellsPieceByIdx(idx);
           else this.replace(tuple, idx);
        }
      }.bind(this));
  },
	/**
	/**
	 * toString()
	 */
  toString: function(){ // Board
    game.log.warn('entered Board#toString',{'indent':3});
    // stateに載せる文字列を返す
    var ret = '';
    for (var c = 1; c < this.game.width; c++) {
      for (var r = 1; r < this.game.height; r++) {
// game.log.debug('start check at r: ' + r + ', c : ' + c);
if(this.cells && this.cells[r] && this.cells[r][c])
        ret += this.cells[r][c].say();
else
  game.log.warn('no cell at r: ' + r + ', c : ' + c);
      }
    }
    game.log.warn('leaving Board#toString with : ' + ret, {'indent':-3});
    return ret;
  },
	/**
	 * toJSON()
	 */
  toJSON: function() {
    var ret = '[';
    for (var r = 0; r < this.game.height; r++) {
      ret += '[';
      for (var c = 0; c < this.game.width; c++) {
        ret += this.cells[r][c].toJSON();
        if (this.cells[r][c+1]) ret += ',';
      }
      ret += ']';
      if (this.cells[r+1]) ret += ',';
    }
    ret += ']';
    return ret;
  },
	/**
	 * reverse(top)
	 */
  reverse: function(top) { // Board
this.game.log.warn('reverse called.');
    this.cells.flatten().each(function(c){
this.game.log.warn('reverse called. cell is ' + c.toDebugString());
      if (c.piece) {
this.game.log.warn('reverse class name called. piece is ' + c.piece.toDebugString());
        if (c.piece.isBlack()) {
          if (this.game.top === 0){
            c.piece.elm.removeClassName('top');
            c.piece.elm.addClassName('bottom');
          } else {
            c.piece.elm.removeClassName('bottom');
            c.piece.elm.addClassName('top');
          }
        } else {
          if (this.game.top === 0){
            c.piece.elm.removeClassName('bottom');
            c.piece.elm.addClassName('top');
          } else {
            c.piece.elm.removeClassName('top');
            c.piece.elm.addClassName('bottom');
          }
        }
this.game.log.warn('reverse class name after process. ' + c.piece.toDebugString());
      }
    });
  },
	/**
	 * toDebugString()
	 */
  toDebugString: function(){ // Board
    var ret = '';
    for (var r = 0; r < this.game.height; r++) {
      for (var c = 0; c < this.game.width; c++) {
        ret += ('rc:' + r.toString() + c.toString());
        if(this.cells[r][c].elm){
          ret += (',left:' + this.cells[r][c].elm.style.left);
          ret += (',top:' + this.cells[r][c].elm.style.top);
        }
        ret += '.';
      }
      ret += '<br>';
    }
    return ret;
  }
});

/**
 * Stand
 */
Stand = Class.create({
	/**
	 * initialize(id, game)
	 */
  initialize: function(id, game) {
    this.game = game;
    this.top = game.top;
    this.width = 1; 
    this.height = game.height - 1;
    this.id = id;
    this.type = 'stand';
    this.initialString = '';
    this.pieces = $A([]);
    this.createElm();
  },
	/**
	 * createElm()
	 */
  createElm: function() {  // Stand
    this.elm = document.createElement('div');
    this.elm.id = this.id;
    this.elm.obj = this;
    this.elm.style.height = (this.game.height - 1)*30 + 'px';
  },
	/**
	 * removeByObj(piece)
	 */
  removeByObj: function(piece){  // Stand
    // 指定された駒のオブジェクトを駒台から取り除く
    this.elm.removeChild(piece.elm);
    this.pieces.subtract([piece]);
  },
	/**
	 * removeStandsPieceByChr(chr)
	 */
  removeStandsPieceByChr: function(chr){  // Stand
    // chrで指定された駒を駒台から取り除く
    // 取り除いたpieceを返す
    var target = this.pieces.find(function(p){ return p.chr == chr; });
    this.elm.removeChild(target.elm);
    this.pieces.subtract([target]);
    return target;
  },
	/**
	 * read(str)
	 */
  read: function(strFromState){ // Stand
    this.game.log.debug('entered  Stand#read with : ' + strFromState );
    // stateから読んだ文字列を元に駒を駒台に置く
    // strFromStateが空文字列ならclearして終わり
    if (strFromState.length == 0){  this.pieces.clear(); return; }
    // 現在のstandの状態との差分を埋める
    var str_now = this.toString();
    this.game.log.debug('Stand#read str_now : ' + str_now, {'indent':1} );
    // 現在にあり、strFromStateにないものは現在から消す
    var deleteCandidate = str_now.subtract(strFromState);
    this.game.log.debug('Stand#read deleteCandidate : ' + deleteCandidate );
    $A(deleteCandidate).each(function(c){
      this.removeStandsPieceByChr(c);
    }.bind(this));  
    // 現在になく、strにあるものは現在へ足す
    var addCandidate = strFromState.subtract(str_now);
    this.game.log.debug('Stand#read addCandidate : ' + addCandidate, {'indent':-1} );
    $A(addCandidate).each(function(c){
      this.put_from_read(new Piece(c));
    }.bind(this));
    this.game.log.debug('leaving  Stand#read' );
  },
	/**
	 * clear()
	 */
  clear: function(){ // Stand
    // Standの内容はfromStateにより毎回更新されるので、その都度クリアする
    // この処理は本来いらないことであるべきでは？
    this.pieces.clear();
  },
	/**
	 * put(piece)
	 */
  put: function(piece){ // Stand
    // 駒台に持ち駒を載せる
    this.game.log.debug('entered  Stand#put with : ' );
    //this.game.log.debug('entered ' + this.id + ' Stand#put with : ' + piece.toDebugString());
    piece.toggleBW();
    piece.addDraggableIfNeeded('draggable added at being put at stand');
    piece.cell = null;
    this.pieces.push(piece);
    this.elm.appendChild(piece.elm);
    this.game.log.debug('leaving ' + this.id + ' Stand#put : ' + piece.toDebugString());
  },
	/**
	 * put_from_read(piece)
	 */
  put_from_read: function(piece){ // Stand
    // 駒台に持ち駒を載せるが、readからの場合、chrはそのまま。toggleはしない
    this.game.log.debug('entered ' + this.id + ' Stand#put_from_read with : ' + piece.toDebugString());
    piece.addDraggableIfNeeded('draggable added at being put at stand from read');
    piece.cell = null;
    this.pieces.push(piece);
    this.elm.appendChild(piece.elm);
    this.game.log.debug('leaving ' + this.id + ' Stand#put : ' + piece.toDebugString());
  },
	/**
	 * pull(piece)
	 */
  pull: function(piece){ // Stand
    // 駒台から持ち駒を離す
    this.pieces.pop(piece);
  },
	/**
	 * show()
	 */
  show: function(){ // Stand
  },
	/**
	 * toString()
	 */
  toString: function(){ // Stand
    this.game.log.debug('entered Stand#toString : ' + this.id);
    // stateに載せる文字列を返す
    var ret = '';
    if(this.pieces.size() > 0)
      ret += this.pieces.pluck('chr').join('');
    this.game.log.debug('leaving Stand#toString with : ' + ret);
    return ret;
  },
	/**
	 * toDebugString()
	 */
  toDebugString: function(){ // Stand
    var ret = '';
    ret += 'id: ' + this.id;
    ret += ', type: ' + this.type;
    ret += ', pieces.size: ' + this.pieces.size();
    return ret;
  }
});

/**
 * Player
 */
Player = Class.create({
	/**
	 * initialize(id, name, mine)
	 */
  initialize: function(id, name, isViewer ) {
    this.id = id;
    this.name = name;
    this.isViewer = isViewer;
  },
	/**
	 * stand()
	 */
  stand: function(){
    return (this.id == 'player1') ?
        window.game.blackStand
      : window.game.whiteStand;
  },
	/**
	 * atTop()
	 */
  atTop: function(game){ // Player
    return (this.id == 'player1') == (window.game.top == 1);
  },
	/**
	 * shortName()
	 */
  shortName: function() {
    return this.name.split('@').first();
  },
	/**
	 * statusHtml()
	 */
  statusHtml: function() {
// playerのshort nameのspan のHTMLを返す。mine, turnのどちらかあるいは両方をclassとして指定する。
// classの意味（効果はcssで次のように定義されている。）
// mine は下線をひく
// turn は背景色を黄色にする
    var classNames = this.isViewer ? 'mine' : '';
    if (window.game.getTurn() == this) classNames += ' turn';
    return '<span class="' + classNames + '">' + this.shortName() + '</span>';
  },
	/**
	 * toString()
	 */
  toString: function() { // Player
    return this.name;
  },
	/**
	 * toDebugString()
	 */
  toDebugString: function() { // Player
    return 'Player: name: ' + this.name + ', isViewer: ' +  this.isViewer + ', atTop: ' + this.atTop(); 
  }
});

/**
 * AnimalShogiGame
 */
AnimalShogiGame = Class.create({
	/**
	 * initialize(settings)
	 */
  initialize: function(settings) {
    this.log = new Log(Log.DEBUG, Log.popupLogger);
 //   this.log.setLevel('none');
    this.log.warn('start log',{'indent':1});
    this.width = 4;  // 0 is dummy
    this.height = 5;
    this.settings = settings;
    this.playingViewer = null;
    this.log.warn('01');
    this.container = $(settings.containerId);
    this.log.warn('02');
    this.controlPanel = new ControlPanel(this);
    this.log.warn('CP created.');
    this.board = new Board(this.container, this);
    this.log.warn('Board created.');
    this.blackStand = new Stand('black-stand', this);
    this.log.warn('03');
    this.whiteStand = new Stand('white-stand', this);
    this.log.warn('Stand created.');
    this.mode = 'init';
    this.log.warn('04');
    this.message(t('click_join_button'));
    this.count = 0;
       // 手数。このgameではcount手目を指した局面がthis.board, this.blackStand, this.whiteStandに反映されているものとする.
    this.top_by_viewer = false;
      // viewerが反転ボタンでtopを決定したとき、その値を持つ。
      // それまではfalse. したがって、これがfalseのあいだはplayerとviewerの関係のみで
      // topを決めることができる。
      // すなわち、
      //  viewer == player1 のとき、top = 0 (player1がbottomなので)
      //  viewer == player2 のとき、top = 1 (player2がbottomなので)
      //  viewer がplayerでないとき、top = 0 （先手がbottomがデフォルトであるので)
    this.determineTop();
      //  Boardのinitializeにおいてはtop=0を前提にstyle.top, style.leftを決めている
      //  ので、topが決まったこの時点で必要なら修正しておく必要がある
    this.board.adjust();
      //  持ち駒の位置も決めておく
    this.setStandPosition();
    this.log.warn('leaving AnimalShogiGame#initialize',{'indent':-1, 'date':true,3:{'color':'green'}});
  },
	/**
	 * setStandPosition()
	 */ 
  setStandPosition: function() { // Game
    $('container').style.width = 180 + (this.width)*30 + 'px';
    if(this.top !== 1){
      $('bottom-stand').appendChild(this.blackStand.elm);
      $('top-stand').appendChild(this.whiteStand.elm);
    } else {
      $('bottom-stand').appendChild(this.whiteStand.elm);
      $('top-stand').appendChild(this.blackStand.elm);
    }
    $('bottom-stand').style.height = (this.height - 1)*30 + 'px';
    $('bottom-stand').style.margin = (this.height - 3)*30 + 'px 10px 0px 0px';
    $('top-stand').style.height = (this.height - 1)*30 + 'px';
    $('animal-shogi').style.height = 30 + (this.height)*30 + 'px';
    $('animal-shogi').style.width = 80 + (this.width)*30 + 'px';
  },
	/**
	 * determineTop()
	 */
  determineTop: function() { // Game
this.log.debug('entered Game#determineTop : ', {'indent':1});
     // 先手(player1)がbottomのとき0, top = 1 なら先手がtop
     // はじめからtop が１になるのはplayer2がviewerのときだけ
     // あとはviewerが反転ボタンで指定したとき
    if (this.top_by_viewer){
       this.top = this.top_by_viewer;
    } else {
      this.top = 0;  // by default
      if (this.player2 && this.player2.isViewer) this.top = 1;
    }
this.log.debug('leaving determineTop with game.top : ' + this.top, {'indent':-1});
  },
	/**
	 * setPlayer(name, opponent)
	 */
        // GameのsetPlayerが呼ばれるのはjoinボタンが押されたときだけ
  setPlayer: function(name, opponent) { // Game
    if (!this.player1) {
      this.player1 = new Player('player1', name, !opponent);
      if (!opponent) this.playingViewer = this.player1;
      this.controlPanel.update();
      this.message(t('waiting'));
      wave.getState().submitDelta({
        player1:name
      });
    }
    else if (!this.player2) {
      if (name != this.player1.name){
        this.player2 = new Player('player2', name, !opponent);
        if (!opponent) this.playingViewer = this.player2;
        this.determineTop();
        this.controlPanel.update();
        this.message('');
        this.start();
        wave.getState().submitDelta({
          player2:name
        });
      } else
        this.message(t('cannot_play_with_same_person'));
    }
      // TODO
      //throw 'Invalid Player Data';
  },
	/**
	 * message(message)
	 */
  message: function(message) {
    if (!this.messageElm) {
      this.messageElm = $('message-body');
    }
    this.messageElm.innerHTML = message;
  },
	/**
	 * clearMessage()
	 */
  clearMessage: function() {
    this.message('');
  },
	/**
	 * show()
	 */
  show: function() { // game
this.log.warn('game.show');
    //this.board.show();
  },
	/**
	 * reverse()
	 */
  reverse: function() { // game
    var tmp = null;
    this.top = (this.top === 0 ? 1 : 0);
    this.top_by_viewer = this.top;
    this.message('game.top became ' + this.top);
    this.board.reverse();
    this.board.adjust();
    tmp = $('top-stand').childElements()[0];
    $('top-stand').appendChild($('bottom-stand').childElements()[0]);
    $('bottom-stand').appendChild(tmp);
    tmp = $$('#top-stand img', '#bottom-stand img');
    if(tmp.size() > 0){
      tmp.invoke('toggleClassName', 'top');
      tmp.invoke('toggleClassName', 'bottom');
    }
    this.controlPanel.reverse();
  },
	/**
	 * start()
	 */
  start: function() { // Game
    this.log.warn('game.start was called.');
    this.determineTop();
    this.controlPanel.update();
    this.board.show();
    this.log.warn('leaving game.start.');
  },
	/**
	 * nextTurn()
	 */
  nextTurn: function() { // Game
this.log.debug('entered Game#nextTurn', {'indent':1});
    this.count++;
    this.controlPanel.update();
    this.clearMessage();
this.log.debug('leaving Game#nextTurn', {'indent':-1});
  },
	/**
	 * getTurn()
	 */
  getTurn: function() {
    // turnは論理値。countが偶数ならtrueで先手番、奇数ならfalseで後手番。
    return (this.count % 2 == 0);
  },
	/**
	 * thisTurnPlayer()
	 */
  thisTurnPlayer: function() {
    return this.getTurn() ? this.player1 : this.player2;
  },
	/**
	 * isViewersTurn()
	 */
  isViewersTurn: function() {
    return this.thisTurnPlayer().name == wave.getViewer().getId();
  },
	/**
	 * finish(winner)
	 */
  finish: function(winner) {
    this.message(winner.shortName() + t('win'));
  },
	/**
	 * stateChanged()
	 */
  stateChanged: function() {  // Game
    var state = wave.getState();
this.log.warn('stateChanged: ' + arrange(state));
    this.fromState(state);
this.log.warn('leaving stateChanged:');
  },
	/**
	 * toString()
	 */
  toString: function() { // Game
    var ret = '';
    var json = this.toJSON();
    for (var key in json) {
      ret += key + ' : ' + json[key] + '\n';
    }
    return ret;
  },
	/**
	 * toHTML()
	 */
  toHTML: function() {
    var ret = '<table>';
    var json = this.toJSON();
    for (var key in json) {
      ret += '<tr><td>' + key + '</td><td>' + json[key] + '</td></tr>\n';
    }
    ret += '</table>';
    return ret;
  },
	/**
	 * processPlayer(state)
	 */
  processPlayer: function(state){ // Game
this.log.debug('entered processPlayer: viewer: ' + viewer);
    var viewer = wave.getViewer().getId();
    var pl1 = state.get('player1');
    var pl2 = state.get('player2');
    if(!pl1 && !pl2){
this.log.debug('leaving processPlayer because state has no player.');
      return;
    }
    if (!this.player1 && pl1) {  // 各normalスナップに1回通る
this.log.debug('processPlayer: processing Player1: ');
      var pl1IsViewer = (pl1 == viewer);
      this.player1 = new Player('player1', pl1, pl1IsViewer );
      this.controlPanel.update();
this.log.info('leaving processing Player1: ');
    }
    if (!this.player2 && pl2) {  // 各normalスナップに1回通る
this.log.warn('processPlayer: processing Player2: ');
      var pl2IsViewer = (pl2 == viewer);
      this.player2 = new Player('player2', pl2, pl2IsViewer );
this.debug_dump();
      this.controlPanel.update();
this.log.warn('backed into processPlayer: processing Player2: ');
      this.start();
this.log.warn('leaving processPlayer: processing Player2: ');
    }

    if (this.player1 && this.player1.isViewer) {
      this.playingViewer = this.player1;
    }
    else if (this.player2 && this.player2.isViewer) {
      this.playingViewer = this.player2;
    }
    this.determineTop();
if(this.playingViewer) this.log.debug('playingViewer is defined : ' + this.playingViewer);
    if (this.player1 && this.player2) {
      this.message('');
      $('join-button').hide();
    }
this.log.warn('leaving processPlayer: viewer: ' + viewer);
  },
	/**
	 * fromState(state)
	 */
  fromState: function(state) { // game
    LogIndent = 0;
    this.log.warn('<span style="color:#00FFFF">entered fromState</span>');
    this.processPlayer(state);
    this.count = state.get('count');
    this.board.read(state.get('board', this.board.initialString));
    this.blackStand.read(state.get('bstand', this.blackStand.initialString));
    this.whiteStand.read(state.get('wstand', this.whiteStand.initialString));
    this.controlPanel.update();
  },
	/**
	 * debug_dump()
	 */
  debug_dump: function(){
    this.log.warn('debug_dump enterd', {'indent':2});
    var state = wave.getState();
    this.log.warn(state.toString());
    var obj = {};
    obj['player1']	 = (this.player1 ? this.player1.toDebugString():null);
    this.log.debug('00');
    obj['player2']	 = (this.player2 ? this.player2.toDebugString():null);
    this.log.debug('01');
    obj['playingViewer'] = (this.playingViewer ? this.playingViewer.toDebugString():null);
    this.log.debug('01');
    obj['top']		 = this.top;
    this.log.debug('02');
    //obj['board']	 = this.board.toDebugString();
    obj['board']	 = this.board.toString();
    this.log.debug('04');
    obj['blackStand']	 = this.blackStand.toString();
    this.log.debug('05');
    obj['whiteStand']	 = this.whiteStand.toString();
    this.log.debug('06');
    //obj['Cell']	 = Cell.all.invoke('toDebugString').join('<br>');
    obj['PieceOnBoard']	 = '<br>' + this.board.cells.flatten().findAll(function(c){ return c.piece != null; }).invoke('toDebugString').join('<br>');
    obj['PieceOnBlackStand']	 = this.blackStand.elm.childElements().pluck('obj').invoke('toDebugString').join('<br>');
    obj['PieceOnWhiteStand']	 = this.whiteStand.elm.childElements().pluck('obj').invoke('toDebugString').join('<br>');
    this.log.debug('07');
    for(var p in obj){
      this.log.warn(p + ' : ' + obj[p]);
    }
    this.log.warn('leaving debug_dump', {'indent':-2});
  }
});

/**
 * common functions
 */
	/**
	 * sendDelta()
	 */
function sendDelta(){
   // 送信
   var delta = {};
   delta['board'] = window.game.board.toString();
   delta['bstand'] = window.game.blackStand.toString();
   delta['wstand'] = window.game.whiteStand.toString();
   delta['count'] = window.game.count.toString();
window.game.log.warn('<div style="color:#FF0000">sending delta : </div>' + delta.toString());
   wave.getState().submitDelta(delta);
}

	/**
	 * moveValidate(piece, fromCell, toCell)
	 */
function moveValidate(piece, fromCell, toCell){
window.game.log.debug('moveValidate entered: piece: ' + piece.toDebugString(),{'indent':1});
   if (!window.game.isViewersTurn()) {
     window.game.message(t('not_your_turn')); return false;
   }
window.game.log.debug('moveValidate 1');
   if (toCell.piece) {
     if (piece.isBlack() == toCell.piece.isBlack()){
       window.game.message(t('cannot_capture_yourown_piece')); return false;
     }
   }
window.game.log.debug('moveValidate 2');
   if(!fromCell && toCell.piece) {
     window.game.message(t('already_occupied')); return false;
   }
window.game.log.debug('moveValidate 3');
   if (!piece.canMove(fromCell, toCell)) {
     window.game.message(t('not_allowed')); return false;
   }
window.game.log.debug('leaving moveValidate', {'indent':-1});
   return true;
}

	/**
	 * checkFinish_new(piece, toCell)
	 */
function checkFinish_new(piece, toCell){
window.game.log.warn('checkFinish 1');
   var ret = (
   // 相手のライオンを捕獲
   (toCell.piece.type == 'lion') || 
   // 自分のライオンが最奥に到達
   (piece.type == 'lion' && piece.isGoal(toCell) && window.game.isSafety(piece))
  );
window.game.log.warn('checkFinish leaving with : ' + ret);
  return ret;
}
	/**
	 * checkFinish(piece, toCell)
	 */
function checkFinish(piece, toCell){
          return (
          // 相手のライオンを捕獲
          //(capturedPiece && capturedPiece.type == 'lion') || 
          // 自分のライオンが最奥に到達
          (piece.type == 'lion' && piece.isGoal(toCell) && window.game.isSafety(piece))
	  );
}
