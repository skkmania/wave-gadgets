var Type2chr = { 'chick' : 'a', 'elephant' : 'b', 'giraffe' : 'c', 'lion' : 'd', 'chicken' : 'e' };
var Chr2Type = { 'a' : 'chick', 'b' : 'elephant', 'c' : 'giraffe', 'd' : 'lion', 'e' : 'chicken' };

function create_piece(chr){
window.gameController.game.log.getInto();
  window.gameController.game.log.debug('entered create_piece: ' );
  var p = new Piece(chr);
  window.gameController.game.log.debug('leaving create_piece with :' + p.toDebugString() );
window.gameController.game.log.goOut();
  return p;
}

function addDraggable(piece, startMessage){
  window.gameController.log.getInto('addDraggable');
  window.gameController.log.debug('piece:' + piece.toDebugString());
  window.gameController.log.debug('msg:' + startMessage,{3:{'color':'#aa8844'}});
  window.gameController.log.goOut();

  return  new Draggable(piece.elm, {
        onStart: function onStart() {
          window.gameController.game.log.getInto('Draggable#onStart of ' + piece.toDebugString());
          window.gameController.game.log.warn('Drag started. : ' + startMessage, {3:{'color':'#33AA88'}});
          window.gameController.game.log.goOut();
        },
        onEnd: function onEnd() {
          window.gameController.game.log.getInto('Draggable#onEnd of ' + piece.toDebugString());
          this.elm.style.top = 0;
          this.elm.style.left = 0;
          window.gameController.game.log.goOut();
        }.bind(piece)
      });
}

/**
 * Piece Class
 */
Piece = Class.create({
	/**
	 * initialize(chr)
	 */
  initialize: function initialize(chr, game) { // Piece
    this.game = game || window.gameController.game;
    this.game.log.getInto('Piece#initialize');
    this.game.log.warn('Piece#initialize entered with : ' + chr, {'indent':1});
    this.type = Chr2Type[chr.toLowerCase()];
    this.game.log.warn('Piece#initialize type is : ' + this.type);
    Object.extend(this, PieceTypeObjects[this.type]);
    this.game.log.warn('Piece#initialize imageUrl is : ' + this.imageUrl);
    this.cell = null;
    this.chr = chr;
    this.createElm();
    this.game.log.debug(this.toDebugString()); 
    this.game.log.goOut();
  },
	/**
	 * isBlack()
	 */
  isBlack: function isBlack() {  // Piece
//this.game.log.debug('Piece#isBlack entered : ');
    var ret = (this.chr.toUpperCase() == this.chr);
//this.game.log.debug('leaving Piece#isBlack with : ' + ret);
    return ret;
  },
	/**
	 * toggleBW()
	 */
  toggleBW: function toggleBW() {  // Piece
    this.game.log.getInto('Piece#toggleBW');
    if (this.chr == this.chr.toUpperCase())
      this.chr = this.chr.toLowerCase(); 
    else
      this.chr = this.chr.toUpperCase(); 

    this.elm.toggleClassName('top');
    this.elm.toggleClassName('bottom');

    this.game.log.goOut();
  },
	/**
	 * toggleDraggable()
	 */
  toggleDraggable: function toggleDraggable(){ // Piece
    this.game.log.getInto('Piece#toggleDraggable');
    this.game.log.debug('entered Piece#toggleDraggable:'+this.toDebugString());
    this.game.log.debug('count : '+this.game.controller.count);
    this.game.log.debug('isViewersP : '+this.isViewersP());
    this.game.log.debug('isViewersTurn : '+this.game.controller.isViewersTurn());
    if (this.drag){
      if(!this.isViewersP()){
        this.game.log.debug('to destroy drag because this is not Vieweres piece. : '+ Draggables.drags.length);
        this.drag.destroy();
        this.game.log.debug('length of drags became : '+ Draggables.drags.length);
        this.drag = null;
      }
      if(this.isViewersP() && !this.game.controller.isViewersTurn()){
        this.game.log.debug('to destroy drag because this is not Vieweres turn. : '+ Draggables.drags.length);
        this.drag.destroy();
        this.game.log.debug('length of drags became : '+ Draggables.drags.length);
        this.drag = null;
      }
    } else if(this.isViewersP() && this.game.controller.isViewersTurn()){
      this.drag = addDraggable(this, 'toggled');
    }
    this.game.log.debug('leaving Piece#toggleDraggable');
    this.game.log.goOut();
  },
	/**
	 * createElm()
	 */
  createElm: function createElm() {  // Piece
this.game.log.getInto('Piece#createElm');
    this.elm = document.createElement('img');
    this.elm.obj = this;
    this.elm.src = this.imageUrl;
    this.elm.addClassName('piece');
    if (!this.atTop()) {
      this.elm.addClassName('bottom');
    }
    else {
      this.elm.addClassName('top');
    }
this.game.log.goOut();
  },
	/**
	 * setClassName(player)
	 */
  setClassName: function setClassName() { // Piece
this.game.log.getInto('Piece#setClassName');
this.game.log.warn('chr : ' + this.chr + ',  atTop : ' + this.atTop() + ',  this.elm.classname: ' + this.elm.className);
    if (!this.atTop()) {
      this.elm.addClassName('bottom');
      this.elm.removeClassName('top');
    }
    else {
      this.elm.removeClassName('bottom');
      this.elm.addClassName('top');
    }
if (window.gameController.game){ window.gameController.game.log.warn('leaving piece setClassName : ' + this.chr + ',  atTop : ' + this.atTop() + ',  this.elm.classname: ' + this.elm.className);
this.game.log.goOut();
}
  },
	/**
	 * atTop()
	 */
  atTop: function atTop(){ // Piece
    return (this.game.controller.top == 1) == this.isBlack();
  },
	/**
	 * isTurn()
	 */
        // このコマが現在手番かどうかを返す
  isTurn: function isTurn(){ // Piece
    if (this.game.controller.getTurn()) return this.isBlack();
    else return !this.isBlack();
  },
	/**
	 * canMoveTo(x, y)
	 */
        // このコマが座標x,yに動けるかどうか返す
        // このコマがセル上にいるとき限定の関数
        // しかも隣り合うセル間の移動に限定の関数
  canMoveTo: function canMoveTo(x, y) { // Piece
    this.game.log.getInto('Piece#canMoveTo');
    var dx = x - this.cell.x;
    var dy = y - this.cell.y;
    if (!this.isBlack()) dy *= -1;
    this.game.log.debug('dx, dy : ' + dx + ', ' + dy);
    this.game.log.debug('leaving with: ' + this.movableArea[dy + 1][dx + 1]);
    this.game.log.goOut();
    return this.movableArea[dy + 1][dx + 1];
  },
	/**
	 * canMove(fromObj, toCell)
	 */
  canMove: function canMove(fromObj, toCell) { // Piece
this.game.log.getInto('Piece#canMove');
    if (fromObj.type == 'stand'){
       this.game.log.goOut();
       return true; // 打ち駒はどこでもOK
    }
    var dx = toCell.x - fromObj.x;
    var dy = toCell.y - fromObj.y;
window.gameController.game.log.debug('from: ' + fromObj.toDebugString() + ', to: ' + toCell.toDebugString());
window.gameController.game.log.debug('dx: ' + dx + ', dy: ' + dy);
    if (1 < Math.abs(dx) || 1 < Math.abs(dy)){
       this.game.log.goOut();
       return false;
    }
    if (!this.isBlack()) dy *= -1;
this.game.log.debug('leaving with: ' + this.movableArea[dy + 1][dx + 1]);
this.game.log.goOut();
    return this.movableArea[dy + 1][dx + 1];
  },
	/**
	 * move(fromCell, toCell, notCapture, dropOrState)
	 */
  move: function move(fromCell, toCell, notCapture, dropOrState) {  // Piece
this.game.log.getInto();
window.gameController.game.log.warn('Piece#move 1 : ');
    var capturedPiece = null;
    var movingPiece = null;
    if(fromCell) movingPiece = fromCell.removeOwnPiece();
window.gameController.game.log.warn('Piece#move 2 : ');
    capturedPiece = toCell.replaceOwnPieceWith(movingPiece);
window.gameController.game.log.warn('Piece#move 3 : ');
this.game.log.goOut();
    return capturedPiece;
  },
	/**
	 * sitOnto(cell)
	 */
  sitOnto: function sitOnto(distination_cell) { // Piece
    this.game.log.getInto('Piece#sitOnto');
    this.game.log.debug('entered : ' + distination_cell.toDebugString(), {'indent':1});
    if(this.cell) this.cell.elm.removeChild(this.elm);
    distination_cell.piece = this;
    distination_cell.elm.appendChild(this.elm);
    this.cell = distination_cell;
    this.game.log.debug('leaving Piece#sitOnto as ' + this.toDebugString(), {'indent':-1});
    this.game.log.goOut();
  },
	/**
	 * gotoOpponentsStand()
	 */
  gotoOpponentsStand: function gotoOpponentsStand() { // Piece
    this.game.log.getInto('Piece#gotoOpponentsStand');
    this.game.log.debug('piece: ' + this.toDebugString(), {'indent':1});
    if(this.unpromote_type){
      this.unpromote();
      this.game.log.debug('unpromoted : ' + this.toDebugString());
    }
    if(this.isBlack()){
      this.game.log.debug('001');
      this.game.whiteStand.put(this);
      this.game.log.debug('002');
    } else {
      this.game.log.debug('101');
      this.game.blackStand.put(this);
      this.game.log.debug('102');
    }
      this.game.log.debug('leaving Piece#gotoOpponentsStand : ', {'indent':-1});
      this.game.log.goOut();
  },
	/**
	 * isViewersP()
	 */
  isViewersP: function isViewersP(game) { // Piece
    this.game.log.getInto('Piece#isViewersP');
    if (this.isBlack()){
      this.game.log.debug('owner name : ' + this.game.controller.player1.name);
      this.game.log.goOut();
      return this.game.controller.player1.isViewer;
    } else {
      this.game.log.debug('owner name : ' + this.game.controller.player2.name);
      this.game.log.goOut();
      return this.game.controller.player2.isViewer;
    }
  },
	/**
	 * isGoal(cell)
	 */
  isGoal: function isGoal(cell) { // Piece
    return ( this.isBlack() ? (cell.y === 1) : (cell.y === 4) );
  },
	/**
	 * promote(actionContents)
	 */
  promote: function promote(actionContents) {  // Piece
    this.game.log.getInto('Piece#promote');
    if(this.promote_type){
      this.imageUrl = PieceTypeObjects[this.promote_type].imageUrl;
      this.elm.src = this.imageUrl;
      this.type = PieceTypeObjects[this.promote_type].type;
      if(this.isBlack())
        this.chr = Type2chr[this.type].toUpperCase();
      else
        this.chr = Type2chr[this.type];
      this.movableArea = PieceTypeObjects[this.promote_type].movableArea;
      this.game.log.debug('promoted : ' + this.toDebugString());
    } else {
      this.game.log.fatal('this piece cannot promote.');
    }
    this.game.log.goOut();
  },
  	/**
	 * unpromote(actionContents)
	 */
  unpromote: function unpromote(actionContents) {  // Piece
    this.game.log.getInto('Piece#unpromote');
    if(this.unpromote_type){
      this.imageUrl = PieceTypeObjects[this.unpromote_type].imageUrl;
      this.elm.src = this.imageUrl;
      this.type = PieceTypeObjects[this.unpromote_type].type;
      if(this.isBlack())
        this.chr = Type2chr[this.type].toUpperCase();
      else
        this.chr = Type2chr[this.type];
      this.movableArea = PieceTypeObjects[this.unpromote_type].movableArea;
      this.game.log.debug('unpromoted : ' + this.toDebugString());
    } else {
      this.game.log.fatal('this piece cannot unpromote.');
    }
    this.game.log.goOut();
  },
	/**
	 * toDebugString()
	 */
  toDebugString: function toDebugString() {  // Piece
    var ret = 'chr: <span style="color: #3F8080">' + this.chr + '</span>, ';
    ret += (', className: ' + this.elm.className);
    if (this.cell && this.cell.elm) ret += (', cell_name:' + this.cell.elm.id);
    else ret += ', [no cell]';
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
  imageUrl: HOST + 'img/lion.png',
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
  imageUrl: HOST + 'img/elephant.png',
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
  imageUrl: HOST + 'img/giraffe.png',
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
  imageUrl: HOST + 'img/chick.png',
  type: 'chick',
  movableArea: [
    [false,  true, false],
    [false, false, false],
    [false, false, false]
  ],
  promote_type: 'chicken'
  },
	/**
	 * Chicken
	 */
  'chicken': {
  imageUrl : HOST + 'img/chicken.png',
  type : 'chicken',
  movableArea : [
      [ true,  true,  true],
      [ true, false,  true],
      [false,  true, false]
    ],
  unpromote_type: 'chick'
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
  initialize: function initialize(board, x, y, top) {
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
  say: function say(){ // Cell
    this.game.log.getInto('Cell#say');
    // このセルにいるpieceの状態を文字にして返す
    if (!this.piece){
      this.game.log.goOut();
      return 'x';
    }
    var retChar = Type2chr[this.piece.type];
    this.game.log.debug('retChar : ' + retChar);
    if(this.piece.isBlack()){
      this.game.log.goOut();
      return retChar.toUpperCase();
    } else {
      this.game.log.goOut();
      return retChar; 
    }
  },
	/**
	 * put(piece)
	 */
  put: function put(piece) { // Cell
this.game.log.warn('Cell#put entered');
    this.piece = piece;
    this.piece.cell = this;
    if(this.elm) this.elm.appendChild(piece.elm);
this.game.log.warn('Cell#put leaving with piece : ' + this.piece.toDebugString());
  },
	/**
	 * move(toY, toX)
	 */
  move: function move(toY,toX){ // Cell
    this.elm.style.left = (this.marginLeft + this.width * toX) + 'px';
    this.elm.style.top = (this.marginTop + this.width * toY) + 'px';
  },
	/**
	 * getPosition()
	 */
  getPosition: function getPosition(){ // Cell
    // top値により、各セルの画面上の座標が決まる
if(this.x === 1 && this.y === 1) window.gameController.game.log.warn('-------Cell#getPosition -----------');
    if (window.gameController.top == 1){
      var bh = window.gameController.game.height;
      this.elm.style.left = (this.marginLeft + this.width * this.x) + 'px';
      this.elm.style.top = (this.marginTop + this.hight * (bh - 1 - this.y)) + 'px';
    } else {
      var bw = window.gameController.game.width;
      this.elm.style.left = (this.marginLeft + this.width * (bw - 1 - this.x)) + 'px';
      this.elm.style.top = (this.marginTop + this.hight * this.y) + 'px';
    }
  },
	/**
	 * createDummyElm()
	 */
  createDummyElm: function createDummyElm() {  // Cell
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
  createElm: function createElm() {  // Cell
    this.elm = document.createElement('div');
    this.elm.id = 'cell-' + this.x + '-' + this.y;
    this.elm.obj = this;
    this.elm.addClassName('cell');
    this.getPosition();
    this.board.elm.appendChild(this.elm);
this.game.log.warn('Droppables to add ' + this.elm.id);
    Droppables.add(this.elm, {
      toDebugString: function toDebugString(){
        return 'Droppable : ' + this.toDebugString();
      }.bind(this),
      accept: 'piece',
	/**
	 * onDrop(draggable)
	 */
      onDrop: function onDrop(draggable) {
        this.game.log.getInto('Droppable#onDrop',{ "background":"#aaccff" });

        // make action contents
        var fromObj = draggable.parentNode.obj;
        var toCell = this;
        var piece = draggable.obj;
        var actionContents = [piece, fromObj, toCell];
        this.game.log.debug('actionContents:');
        this.game.log.debug('piece :' + piece.toDebugString());
        this.game.log.debug('fromObj :' + fromObj.toDebugString());
        this.game.log.debug('toCell :' + toCell.toDebugString());

        // send action to GameController
        this.game.controller.receiveAction(actionContents);
        this.game.log.goOut();

      }.bind(this)
    });
  },
	/**
	 * show()
	 */
  show: function show() { // Cell
window.gameController.game.log.warn('entered show of Cell: ' + this.toDebugString(), {'indent':1});
    if (!this.elm) {
      (this.x === 0 || this.y === 0) ? this.createDummyElm() : this.createElm();
    }
    if (this.piece) {
window.gameController.game.log.warn('in show of Cell, processing -> ' + this.piece.toDebugString());
      this.elm.appendChild(this.piece.elm);
      if(this.piece.isBlack() == (window.gameController.top === 0)){
        this.piece.elm.addClassName('bottom');
        this.piece.elm.removeClassName('top');
      } else {
        this.piece.elm.addClassName('top');
        this.piece.elm.removeClassName('bottom');
      }
window.gameController.game.log.warn('in show of Cell, after process -> ' + this.piece.toDebugString());
    }
window.gameController.game.log.warn('leaving show of Cell: ' + this.toDebugString(), {'indent':-1});
  },
	/**
	 * isOpponentFirstLine(player)
	 */
  isOpponentFirstLine: function isOpponentFirstLine(player) { // Cell
    if (window.gameController.player1.id == player.id) {
      return this.y === 1;
    }
    else if (window.gameController.player2.id == player.id) {
      return this.y === 4;
    }
    else {
      throw 'not reach: ' + player.id;
    }
  },
	/*
	 * deleteOwnPiece()
	 */
  deleteOwnPiece: function deleteOwnPiece(){  // Cell
window.gameController.game.log.getInto();
window.gameController.game.log.debug('entered Cell#deleteOwnPiece');
if(this.piece)window.gameController.game.log.warn('this cell.piece to be deleted: ' + this.piece.toDebugString());
    if(this.piece){
      this.piece.cell = null;
// これができないときは？
      this.elm.removeChild(this.piece.elm);
// このpieceにDraggableがついていたらdestroyしないといけないはず？:w
      if(this.drag){
        this.drag.destroy();
        this.drag = null;
      }
      delete this.piece;
      this.piece = null;
    }
window.gameController.game.log.warn('leaving Cell#deleteOwnPiece as :' + this.toDebugString());
window.gameController.game.log.goOut();
    return;
  }, 
	/**
	 * removeOwnPiece()
	 */
  removeOwnPiece: function removeOwnPiece(){  // Cell
window.gameController.game.log.debug('entered Cell#removeOwnPiece');
if(this.piece)window.gameController.game.log.warn('this cell.piece to be removed: ' + this.piece.toDebugString());
    var ret = null;
    if(this.piece){
      ret = this.piece;
      this.piece.cell = null;
      this.elm.removeChild(this.piece.elm);
      this.piece = null;
    }
window.gameController.game.log.warn('leaving Cell#removeOwnPiece as :' + this.toDebugString());
    return ret;
  },
	/**
	 * replaceOwnPieceWith(newPiece)
	 */
  replaceOwnPieceWith: function replaceOwnPieceWith(newPiece){  // Cell
    // 敵駒のあるセルに自駒を動かすとき、敵駒の敵stand(つまり自分のスタンド）
    // に駒を動かしてから自駒をこのセルに置く
    // この処理は駒を動かすとき、つまりmoveから呼ばれなければならない
window.gameController.game.log.getInto();
window.gameController.game.log.debug('entered Cell#replaceOwnPieceWith newPiece : ' + newPiece.toDebugString(), {'indent':1});
    var tmp = null;
    if(this.piece){
      tmp = this.piece;
      this.piece.gotoOpponentsStand();
      this.piece = null;
    }
    this.piece = newPiece;
    this.put(newPiece);
if (tmp){
  window.gameController.game.log.debug('leaving Cell#replaceOwnPieceWith with : ' + tmp.toDebugString(), {'indent':-1});
  window.gameController.game.goOut();
    return tmp;
} else {
  window.gameController.game.log.debug('leaving Cell#replaceOwnPieceWith nothing', {'indent':-1});
  window.gameController.game.goOut();
    return;
}
  },
	/**
	 * toArray()
	 */
  toArray: function toArray() {
    return [this.x, this.y];
  },
	/**
	 * toJSON()
	 */
  toJSON: function toJSON() {
    if (this.piece) {
      return this.piece.chr;
    }
    else {
      return '';
    }
  },
	/**
	 * toDebugString()
	 */
  toDebugString: function toDebugString(){  // Cell
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
  initialize: function initialize(elm, game) {
game.log.getInto('Board#initialize');
    this.game = game;
    //this.top = game.controller.top;
    this.elm = elm || document.body;
    this.shown = false;
    this.cells = [];
    for (var r = 0; r < this.game.height; r++) {
      var row = [];
      for (var c = 0; c < this.game.width; c++) {
        row.push(new Cell(this, c, r, this.game.controller.top));
      }
      this.cells.push(row);
    }
    this.initialString = 'bxxCdaADcxxB';
    game.log.warn('Board#initialize going to process initialString.');
    $A(this.initialString).each(function(chr, idx){
game.log.getInto('reading initialString');
      game.log.warn('idx: ' + idx);
      if(chr == 'x'){ game.log.goOut(); return; }
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
game.log.goOut();
    }.bind(this));
game.log.goOut();
    game.log.warn('leaving Board#initialize');
  },
	/**
	 * idx2xy(idx)
	 */
  idx2xy: function idx2xy(idx) { // Board
    this.game.log.getInto('Board#idx2xy with : ' + idx);
    // stateの文字列のindex(0スタート）を座標の配列[x,y]にして返す
    var h = this.game.height - 1;
    var ret = [Math.floor(idx/h) + 1.0, idx%h + 1.0]
    this.game.log.info('Board#idx2xy returning with : ' + ret.toString());
    this.game.log.goOut();
    return ret;
  },
	/**
	 * xy2idx(xy)
	 */
  xy2idx: function xy2idx(xy) {
    // 座標の配列[x,y]をstateの文字列のindex(0スタート）にして返す
    var h = this.game.height - 1;
    return (xy[0] - 1)*h + (xy[1]-1);
  },
	/**
	 * adjust()
	 */
  adjust: function adjust() { // Board
    if(!this.cells[1][1].elm) return;
    if(!this.game) return;
    this.game.log.getInto('Board#adjust');
    this.game.log.warn('top is ' + this.game.controller.top);  
    this.cells.flatten().invoke('getPosition');
    this.adjustBorder();
    this.game.log.goOut();
  },
	/**
	 * adjustBorder()
	 */
  adjustBorder: function adjustBorder() { // Board
    this.game.log.getInto('Board#adjustBoarder');
    if(!this.cells[1][1].elm) return;
    if(!this.game) return;
    if(this.game.controller.top === 0){
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
    this.game.log.goOut();
  },
	/**
	 * show()
	 */
  show: function show() {  // Board
this.game.log.getInto('Board#show');
    this.cells.flatten().invoke('show');
    this.adjustBorder();
    this.shown = true;
this.game.log.warn('Board#show leaving');
this.game.log.goOut();
  },
	/**
	 * getCell(x,y)
	 */
        // 座標を指定し、そのセルオブジェクトを返す
        // セルが存在しない座標を指定したらnullを返す
        // dummy cellは返さない。つまりx == 0 or y == 0ならnullを返す
  getCell: function getCell(x, y) { // Board
    if(x < 1 || y < 1) return null; 
    if(x >= this.game.width || y >= this.game.height) return null;
    if(!this.cells[y]){
      this.game.log.fatal('Board#getCell: cells[' + y + '] not exist');
      return null;
    }
    if(!this.cells[y][x]){
      this.game.log.fatal('Board#getCell: cells[' + y + '][' + x + '] not exist');
      return null;
    }
    return this.cells[y][x];
  },
	/**
	 * getCellByIdx(idx)
	 */
  getCellByIdx: function getCellByIdx(idx) {
    var xy = this.idx2xy(idx);
    return this.cells[xy[1]][xy[0]];
  },
	/**
	 * put(chr, idx)
	 */
  put: function put(chr, idx){ // Board
    this.game.log.getInto();
    this.game.log.debug('entered Board#put with chr: ' + chr + ', idx : ' + idx);
    var cell = this.getCellByIdx(idx);
    if(cell.piece){
      this.game.log.debug('Board#put: cell.piece existed : ' + cell.piece.toDebugString());
      if(cell.piece.chr == chr){
        // do nothing
      } else {
        cell.removeOwnPiece();
        var new_piece = create_piece(chr);
        cell.put(new_piece);
      }
    } else {
      this.game.log.debug('Board#put: cell.piece not existed , so initialize piece and put ');
      var new_piece = create_piece(chr);
      this.game.log.debug('Board#put: new_piece was created : ' + new_piece.toDebugString());
      this.game.log.debug('Board#put: putting new piece to : ' + cell.toDebugString());
      cell.put(new_piece);
    }
    this.game.log.debug('leaving Board#put',{'indent':-1});
    this.game.log.goOut();
  },
	/**
	 * deleteCellsPieceByIdx(idx)
	 */
  deleteCellsPieceByIdx: function deleteCellsPieceByIdx(idx){ // Board
    this.game.log.getInto();
    this.game.log.debug('entered Board#deleteCellsPieceByIdx with idx : ' + idx, {'indent':1});
    var cell = this.getCellByIdx(idx);
    if(cell.piece){
      cell.deleteOwnPiece();
    } else {
      // do nothing
    }
    this.game.log.debug('leaving Board#deleteCellsPieceByIdx', {'indent':-1});
    this.game.log.goOut();
  },
	/**
	 * removeCellsPieceByIdx(idx)
	 */
  removeCellsPieceByIdx: function removeCellsPieceByIdx(idx){ // Board
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
  replace: function replace(pair, idx){ // Board
    // pair はpiece.chrを表す文字の組。
    // pair[0](新しい文字)がpair[1](古い文字)を置き換える。
    this.game.log.getInto();
    this.game.log.debug('entered Board#replace with pair: ' + pair.toString() + ', idx : ' + idx);
    var cell = this.getCellByIdx(idx);
    var new_piece = new Piece(pair[0]);
    if(cell.piece){
      cell.replaceOwnPieceWith(new_piece);
    } else {
      cell.put(new_piece);
    }
    this.game.log.debug('leaving Board#replace with : ' + new_piece.toDebugString() );
    this.game.log.goOut();
  },
  	/**
	 * replaceByRead(pair, idx)
	 */
  replaceByRead: function replaceByRead(pair, idx){ // Board
    // pair はpiece.chrを表す文字の組。
    // pair[0](新しい文字)がpair[1](古い文字)を置き換える。
    // stringFromStateを読んだときの処理に使う
    // 置き換えられる駒は消される
    // 置き換える駒は新しく生成される
    this.game.log.getInto();
    this.game.log.debug('entered Board#replaceByRead with pair: ' + pair.toString() + ', idx : ' + idx);
    var cell = this.getCellByIdx(idx);
    var new_piece = new Piece(pair[0]);
    if(cell.piece) cell.deleteOwnPiece();
    cell.put(new_piece);
    this.game.log.debug('leaving Board#replaceByRead with : ' + new_piece.toDebugString() );
    this.game.log.goOut();
  },
	/**
	 * read(strFromState)
	 */
  read: function read(strFromState){ // Board
    this.game.log.getInto('Board#read');
    this.game.log.debug('entered with : ' + strFromState);
    // stateから読んだ文字列を元に駒を盤上に置く
    // 現在の状態との差分を埋める
    var oldBoard = $A(this.toString());
    var newBoard = $A(strFromState);
    newBoard.zip(oldBoard).each(function(tuple, idx){
        if(tuple[0] != tuple[1]){
           if(tuple[1] == 'x') this.put(tuple[0], idx);
           else if(tuple[0] == 'x') this.deleteCellsPieceByIdx(idx);
           else this.replaceByRead(tuple, idx);
        }
      }.bind(this));
    this.game.log.goOut();
  },
	/**
	/**
	 * toString()
	 */
  toString: function toString(){ // Board
    this.game.log.getInto('Board#toString');
    this.game.log.debug('entered Board#toString',{'indent':3});
    // stateに載せる文字列を返す
    var ret = '';
    for (var c = 1; c < this.game.width; c++) {
      for (var r = 1; r < this.game.height; r++) {
        // this.game.log.debug('start check at r: ' + r + ', c : ' + c);
        if(this.cells && this.cells[r] && this.cells[r][c])
                ret += this.cells[r][c].say();
        else
          game.log.warn('no cell at r: ' + r + ', c : ' + c);
      }
    }
    this.game.log.warn('leaving Board#toString with : ' + ret, {'indent':-3});
    this.game.log.goOut();
    return ret;
  },
	/**
	 * toJSON()
	 */
  toJSON: function toJSON() {
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
  reverse: function reverse(top) { // Board
    var log = this.game.log;
    var game = this.game;
    log.getInto('Board#reverse');
    this.cells.flatten().each(function(c){
      log.warn('reverse called. cell is ' + c.toDebugString());
      if (c.piece) {
        log.warn('reverse class name called. piece is ' + c.piece.toDebugString());
        if (c.piece.isBlack()) {
          if (this.game.controller.top === 0){
            c.piece.elm.removeClassName('top');
            c.piece.elm.addClassName('bottom');
          } else {
            c.piece.elm.removeClassName('bottom');
            c.piece.elm.addClassName('top');
          }
        } else {
          if (this.game.controller.top === 0){
            c.piece.elm.removeClassName('bottom');
            c.piece.elm.addClassName('top');
          } else {
            c.piece.elm.removeClassName('top');
            c.piece.elm.addClassName('bottom');
          }
        }
        log.warn('reverse class name after process. ' + c.piece.toDebugString());
      }
    }.bind(this));
    log.goOut();
  },
	/**
	 * toDebugString()
	 */
  toDebugString: function toDebugString(){ // Board
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
  initialize: function initialize(id, game) {
    game.log.getInto('Stand#initialize');
    this.game = game;
    this.top = game.controller.top;
    this.width = 1; 
    this.height = game.height - 1;
    this.id = id;
    this.type = 'stand';
    this.initialString = '';
    this.pieces = $A([]);
    this.createElm();
game.log.goOut();
  },
	/**
	 * createElm()
	 */
  createElm: function createElm() {  // Stand
    this.game.log.getInto('Stand#createElm');
    this.elm = document.createElement('div');
    this.elm.id = this.id;
    this.elm.obj = this;
    this.elm.style.height = (this.game.height - 1)*30 + 'px';
    this.game.log.goOut();
  },
	/**
	 * removeByObj(piece)
	 */
  removeByObj: function removeByObj(piece){  // Stand
    // 指定された駒のオブジェクトを駒台から取り除く
    this.game.log.getInto('Stand#removeByObj');
    this.elm.removeChild(piece.elm);
    this.pieces = this.pieces.reject(function(p){ return p==piece; });
    this.game.log.goOut();
  },
	/**
	 * removeStandsPieceByChr(chr)
	 */
  removeStandsPieceByChr: function removeStandsPieceByChr(chr){  // Stand
    // chrで指定された駒を駒台から取り除く
    // 取り除いたpieceを返す
    var target = this.pieces.find(function(p){ return p.chr == chr; });
    this.elm.removeChild(target.elm);
    //this.pieces.subtract([target]);
    this.pieces = this.pieces.reject(function(p){ return p==target; });
    return target;
  },
	/**
	 * read(str)
	 */
  read: function read(strFromState){ // Stand
    this.game.log.getInto('Stand#read');
    this.game.log.debug('entered Stand#read with : ' + strFromState );
    // stateから読んだ文字列を元に駒を駒台に置く
    // strFromStateが空文字列ならclearして終わり
    if (strFromState.length == 0){
      this.pieces.clear();
      this.game.log.debug('leaving  Stand#read because nothing to do.' );
      this.game.log.goOut();
      return;
    }
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
this.game.log.goOut();
  },
	/**
	 * clear()
	 */
  clear: function clear(){ // Stand
    // Standの内容はboardReadFromStateにより毎回更新されるので、その都度クリアする
    // この処理は本来いらないことであるべきでは？
    this.pieces.clear();
  },
	/**
	 * put(piece)
	 */
  put: function put(piece){ // Stand
    // 駒台に持ち駒を載せる
    this.game.log.getInto('Stand#put');
    this.game.log.debug('this is : ' + this.id + ', piece : ' + piece.toDebugString());
    piece.toggleBW();
    piece.cell = null;
    this.pieces.push(piece);
    this.elm.appendChild(piece.elm);
    this.game.log.debug('leaving ' + this.id + ', Stand#put : ' + piece.toDebugString());
    this.game.log.debug(this.id + ' : ' + this.toString());
this.game.log.goOut();
  },
	/**
	 * put_from_read(piece)
	 */
  put_from_read: function put_from_read(piece){ // Stand
    // 駒台に持ち駒を載せるが、readからの場合、chrはそのまま。toggleはしない
this.game.log.getInto();
    this.game.log.debug('entered ' + this.id + ' Stand#put_from_read with : ' + piece.toDebugString());
    piece.cell = null;
    this.pieces.push(piece);
    this.elm.appendChild(piece.elm);
    this.game.log.debug('leaving ' + this.id + ' Stand#put : ' + piece.toDebugString());
this.game.log.goOut();
  },
	/**
	 * pull(piece)
	 */
  pull: function pull(piece){ // Stand
    // 駒台から持ち駒を離す
    this.pieces.pop(piece);
  },
	/**
	 * show()
	 */
  show: function show(){ // Stand
  },
	/**
	 * toString()
	 */
  toString: function toString(){ // Stand
this.game.log.getInto('Stand#toString');
    this.game.log.debug('entered Stand#toString : id : ' + this.id + ', size : ' + this.pieces.length);
    // stateに載せる文字列を返す
    var ret = '';
    if(this.pieces.length > 0)
      ret += this.pieces.pluck('chr').join('');
    this.game.log.debug('leaving Stand#toString with : ' + ret);
this.game.log.goOut();
    return ret;
  },
	/**
	 * toDebugString()
	 */
  toDebugString: function toDebugString(){ // Stand
    var ret = '';
    ret += 'id: ' + this.id;
    ret += ', type: ' + this.type;
    ret += ', pieces.size: ' + this.pieces.size();
    return ret;
  }
});

/**
 * AnimalShogiGame
 */
AnimalShogiGame = Class.create({
	/**
	 * initialize(settings, log)
	 */
  initialize: function initialize(settings, gameController) { // AnimalShogiGame
// for test only
window.gameController = gameController;
window.gameController.game = this;
    this.controller = gameController;
    this.log = gameController.log;
    this.log.getInto('AnimalShogiGame#initialize');
    this.log.warn('start AnimalShogiGame log');
    this.width = 4;  // 0 is dummy
    this.height = 5;
    this.settings = settings;
    this.playingViewer = null;
    this.log.warn('01');
    this.container = $(settings.containerId);
    this.container.style.width = this.width * 35 + 'px';
    this.log.warn('02');
    this.board = new Board(this.container, this);
    this.log.warn('Board created.');
    this.blackStand = new Stand('black-stand', this);
    this.log.warn('03');
    this.whiteStand = new Stand('white-stand', this);
    this.log.warn('Stands created.');
    this.mode = 'init';
    this.log.warn('04');
//    this.controller.message(t('click_join_button'));
//    this.count = 0;
       // 手数。このgameではcount手目を指した局面がthis.board, this.blackStand, this.whiteStandに反映されているものとする.
    //this.top_by_viewer = false;
      // viewerが反転ボタンでtopを決定したとき、その値を持つ。
      // それまではfalse. したがって、これがfalseのあいだはplayerとviewerの関係のみで
      // topを決めることができる。
      // すなわち、
      //  viewer == player1 のとき、top = 0 (player1がbottomなので)
      //  viewer == player2 のとき、top = 1 (player2がbottomなので)
      //  viewer がplayerでないとき、top = 0 （先手がbottomがデフォルトであるので)
    this.controller.determineTop();
      //  Boardのinitializeにおいてはtop=0を前提にstyle.top, style.leftを決めている
      //  ので、topが決まったこの時点で必要なら修正しておく必要がある
    this.board.adjust();
      //  持ち駒の位置も決めておく(といってもこの時点ではデフォルトにしか決まらない。)
    this.setStandPosition();
    this.makeConfirmActionElement();
    this.log.warn('leaving AnimalShogiGame#initialize',{'indent':-1, 'date':true,3:{'color':'green'}});
    this.log.goOut();
    // this.debug_dump();
  },
	/**
	 * respondValidity(actionContents)
	 */ 
        // GameControllerからactionの正当性を問われる
        // 
  respondValidity: function respondValidity(actionContents) { // AnimalShogiGame
    this.log.getInto('AnimalShogiGame#respondValidity');
    var ret = moveValidate(actionContents);
    this.log.goOut();
    return ret;
  },
	/**
	 * getPlayer(player)
	 */ 
  getPlayer: function getPlayer(player) { // AnimalShogiGame
    this.log.getInto('AnimalShogiGame#getPlayer');
    this.log.debug('player : ' + player.toDebugString());
    this.player = player;
    this.log.goOut();
  },
	/**
	 * setStandPosition()
	 */ 
  setStandPosition: function setStandPosition() { // AnimalShogiGame
    this.log.getInto('AnimalShogiGame#setStandPosition');
    $('container').style.width = 180 + (this.width)*30 + 'px';
    if(this.controller.top !== 1){
      $('bottom-stand').appendChild(this.blackStand.elm);
      $('top-stand').appendChild(this.whiteStand.elm);
      this.log.debug('blackStand is set to bottom beacuse top is ' + this.controller.top);
    } else {
      $('bottom-stand').appendChild(this.whiteStand.elm);
      $('top-stand').appendChild(this.blackStand.elm);
      this.log.debug('blackStand is set to top beacuse top is ' + this.controller.top);
    }
    $('bottom-stand').style.height = (this.height - 1)*30 + 'px';
    $('bottom-stand').style.margin = (this.height - 3)*30 + 'px 10px 0px 0px';
    $('top-stand').style.height = (this.height - 1)*30 + 'px';
    $('animal-shogi').style.height = 30 + (this.height)*30 + 'px';
    $('animal-shogi').style.width = 80 + (this.width)*30 + 'px';
    this.log.goOut();
  },
	/**
	 * show()
	 */
  show: function show() { // AnimalShogiGame
this.log.warn('game.show');
    //this.board.show();
  },
	/**
	 * reverse()
	 */
  reverse: function reverse() { // AnimalShogiGame
    this.controller.log.getInto('AnimalShogiGame#reverse');
    var tmp = null;
    this.controller.top = (this.controller.top === 0 ? 1 : 0);
    this.controller.top_by_viewer = this.controller.top;
    this.controller.message('top became ' + this.controller.top);
    this.board.reverse();
    this.board.adjust();
    if($('top-stand') && $('bottom-stand')){
      tmp = $('top-stand').childElements();
      $('bottom-stand').childElements().each(function(e){ $('top-stand').appendChild(e); });
      tmp.each(function(e){ $('bottom-stand').appendChild(e); });
      tmp = $$('#top-stand img', '#bottom-stand img');
      if(tmp.size() > 0){
        tmp.invoke('toggleClassName', 'top');
        tmp.invoke('toggleClassName', 'bottom');
      }
    }
    this.controller.controlPanel.reverse();
    this.controller.log.goOut();
  },
	/**
	 * start()
	 */
  start: function start() { // AnimalShogiGame
this.log.getInto();
    this.log.warn('game.start was called.');
    this.controller.determineTop();
    this.controlPanel.update();
    this.board.show();
    this.log.warn('leaving game.start.');
this.log.goOut();
  },
	/**
	 * toString()
	 */
  toString: function toString() { // AnimalShogiGame
/*
    var ret = '';
    var json = this.toJSON();
    for (var key in json) {
      ret += key + ' : ' + json[key] + '\n';
    }
    return ret;
*/
    return 'AnimalShogiGame';
  },
	/**
	 * toHTML()
	 */
  toHTML: function toHTML() {
    var ret = '<table>';
    var json = this.toJSON();
    for (var key in json) {
      ret += '<tr><td>' + key + '</td><td>' + json[key] + '</td></tr>\n';
    }
    ret += '</table>';
    return ret;
  },
	/**
	 * askPlayersEnough(players)
	 */
  askPlayersEnough: function askPlayersEnough(players){ // Game
    this.log.getInto('AnimalShogiGame#askPlayersEnough');
    this.log.debug('contents of players : ' + players.join(','));
    var ret = (players.length > 1);
    this.log.goOut();
    return ret;
  },
	/**
	 * processPlayer(state)
	 */
  processPlayer: function processPlayer(state){ // Game
    this.log.getInto();
    var viewer = wave.getViewer().getId();
this.log.debug('entered Game#processPlayer: viewer: ' + viewer);
    var pl1 = state.get('player1');
    var pl2 = state.get('player2');
    if(!pl1 && !pl2){
this.log.debug('leaving processPlayer because state has no player.');
this.log.goOut();
      return;
    }
    if (!this.player1 && pl1) {  // 各normalスナップに1回通る
this.log.getInto();
this.log.debug('processPlayer: processing Player1: ');
      var pl1IsViewer = (pl1 == viewer);
      this.player1 = new Player('player1', pl1, pl1IsViewer );
      this.controlPanel.update();
this.log.info('leaving processing Player1: ');
this.log.goOut();
    }
    if (!this.player2 && pl2) {  // 各normalスナップに1回通る
this.log.getInto();
this.log.warn('processPlayer: processing Player2: ');
      var pl2IsViewer = (pl2 == viewer);
      this.player2 = new Player('player2', pl2, pl2IsViewer );
this.debug_dump();
      this.controlPanel.update();
this.log.warn('backed into processPlayer: processing Player2: ');
      this.start();
this.log.warn('leaving processPlayer: processing Player2: ');
this.log.goOut();
    }

    if (this.player1 && this.player1.isViewer) {
      this.playingViewer = this.player1;
    }
    else if (this.player2 && this.player2.isViewer) {
      this.playingViewer = this.player2;
    }
    this.controller.determineTop();
if(this.playingViewer) this.log.debug('playingViewer is defined : ' + this.playingViewer);
    if (this.player1 && this.player2) {
      this.controller.message('');
      $('join-button').hide();
    }
this.log.warn('leaving Game#processPlayer: viewer: ' + viewer);
this.log.goOut();
  },
        /**
         * allPieces()
         */
  allPieces: function allPieces() { // AnimalShogiGame
    return $A(this.board.cells.flatten().pluck('piece'), this.blackStand.pieces, this.whiteStand.pieces).flatten().compact();
  },
	/**
	 * boardReadFromState(state)
	 */
  boardReadFromState: function boardReadFromState(state) { // AnimalShogiGame
    this.log.getInto('Game#boardReadFromState: ');
    this.log.warn('<span style="color:#00FFFF">entered boardReadFromState</span>');
    //this.processPlayer(state);
    //this.count = state.get('count');
    this.board.read(state.get('board', this.board.initialString));
    this.blackStand.read(state.get('bstand', this.blackStand.initialString));
    this.whiteStand.read(state.get('wstand', this.whiteStand.initialString));
    //this.toggleDraggable();
    //this.controlPanel.update();
    this.log.goOut();
  },
	/**
	 * initialDraggable(turn)
	 */
        // turnには'black','white',falseのいずれかが渡る。
        // falseならなにもしない
        // 'black'なら先手のコマにdraggableをつける
        // 'white'なら後手のコマにdraggableをつける
  initialDraggable: function initialDraggable(turn){ // AnimalShogiGame
    var viewersPiece;
    this.log.getInto('AnimalShogiGame#initialDraggable');
    if(!turn){
      this.log.debug('return withoud adding draggable');
      this.log.goOut();
      return;
    }
    if(turn == 'black'){
      viewersPiece = this.allPieces().findAll(function(e){ return e.chr == e.chr.toUpperCase(); });
    } else {
      viewersPiece = this.allPieces().findAll(function(e){ return e.chr == e.chr.toLowerCase(); });
    }
    this.log.debug('viewersPiece # : ' + viewersPiece.length);
    viewersPiece.each(function(e){ addDraggable(e, 'initially added draggable'); });
    this.log.goOut();
  },
	/**
	 * toggleDraggable()
	 */
  toggleDraggable: function toggleDraggable(){ // AnimalShogiGame
    this.log.getInto('AnimalShogiGame#toggleDraggable');
    this.log.debug('processing pieces of Draggables.drags');
    this.log.debug('Draggables.drags #: ' + Draggables.drags.length);
    if(Draggables.drags.length > 0){
      this.log.debug('contents of Draggables.drags :');
      Draggables.drags.each(function(e){
        var str = e.element && e.element.obj ? e.element.obj.chr : e.toString();
        this.log.debug(str);
      }.bind(this));
    }
      Draggables.drags.each(function(e){
        if(e.element && e.element.obj && e.element.obj.toggleDraggable){
           e.element.obj.toggleDraggable();
        } else {
          this.log.debug('not piece object in drags');
        }
      }.bind(this));
/*
    for(var i=1,length=Draggables.drags.length; i<length; i++){
      Draggables.drags[i].element.obj.toggleDraggable();
    }
*/
    this.log.warn('processing pieces of board.cells');
    this.board.cells.flatten().pluck('piece').compact().invoke('toggleDraggable');
    this.log.warn('processing blackStand');
    this.blackStand.pieces.invoke('toggleDraggable');
    this.log.warn('processing whiteStand');
    this.whiteStand.pieces.invoke('toggleDraggable');
    this.log.goOut();
  },
	/**
	 * proceedAsItis(actionContents)
	 */
  proceedAsItis: function proceedAsItis(actionContents) { // AnimalShogiGame
    this.log.getInto('AnimalShogiGame#proceedAsItis');
    var ret = actionContents[0].proceed;
    this.log.goOut();
    return ret;
  },
	/**
	 * promotePiece(actionContents)
	 */
  promotePiece: function promotePiece(actionContents) { // AnimalShogiGame
    var log = window.gameController.log;
    log.getInto('AnimalShogiGame#promotePiece');
    //log.debug('actionContents : ' + Log.dumpObject(actionContents));
    log.debug('actionContents[0] : ' + actionContents[0].toDebugString());
    var ret = actionContents[0].promote;
    log.goOut();
    return ret;
  },
	/**
	 * makeConfirmActionElement()
	 */
  makeConfirmActionElement: function makeConfirmActionElement() { // AnimalShogiGame
    this.log.getInto('AnimalShogiGame#makeConfirmActionElement');
    // userがクリックする要素を作成
/*
    this.confirmActionElement = new Element('div',{id:'promoteOrNot', className:'confirmAction' });
    this.yesElement = new Element('div',{id:'yesElement'});
    this.noElement = new Element('div',{id:'noElement'});
    this.confirmActionElement.appendChild(this.yesElement);
    this.confirmActionElement.appendChild(this.noElement);
    this.confirmActionElement.style.display = 'block';
*/
    this.confirmActionElement = $('promoteOrNot');
    this.yesElement = $('yesElement');
    this.noElement = $('noElement');
    this.log.goOut();
  },
  	/**
	 * confirmActionByUser(actionContents)
	 */
        // action内容をユーザに提示し、ユーザからそれでよいかどうか確認をとる
        // 成り・不成りを確認することを想定
  confirmActionByUser: function confirmActionByUser(actionContents) { // AnimalShogiGame
    this.log.getInto('AnimalShogiGame#confirmActionByUser');
    // userがクリックする要素を監視開始
    this.confirmActionElement.observe('click',this.controller.getResponseToConfirmActionByUser.bindAsEventListener(actionContents));
    //this.yesElement.observe('click', this.promotePiece(actionContents));
    //this.noElement.observe('click', this.proceedAsItis(actionContents));
    // userがクリックする要素を表示
    //actionContents[2].elm.appendChild(this.confirmActionElement);
    //actionContents[2].elm.hide();
    this.confirmActionElement.show();
    //alert('cell top : ' +  actionContents[2].elm.style.top);
    //alert('cell left : ' +  actionContents[2].elm.style.left);
    this.confirmActionElement.style.left = actionContents[2].elm.cumulativeOffset()[0];
    this.confirmActionElement.style.top = actionContents[2].elm.cumulativeOffset()[1];
    this.confirmActionElement.style.position='absolute';
    this.confirmActionElement.style.zIndex=1000;
    this.confirmActionElement.style.width=100;
    this.confirmActionElement.style.hight=100;
    this.log.goOut();
  },
	/**
	 * doAction(actionContents)
	 */
  doAction: function doAction(actionContents) { // AnimalShogiGame
    var piece = actionContents[0];
    var fromObj = actionContents[1];
    var toCell = actionContents[2];
    var capturedPieceType = null;
    var movingPieceType = piece.type;
    var moveTo = [toCell.x, toCell.y];
    this.log.getInto('AnimalShogiGame#doAction');
    this.log.debug('piece : ' + piece.toDebugString());
    this.log.debug('fromObj : ' + fromObj.toDebugString());
    this.log.debug('toCell : ' + toCell.toDebugString());
    if (toCell.piece){
      this.log.warn('piece moving and capturing. : ');
      this.log.debug('draggable.obj is : ' + piece.toDebugString());
      this.log.debug('toCell.piece is : ' + toCell.piece.toDebugString());
      capturedPieceType = toCell.piece.type;
      toCell.piece.gotoOpponentsStand();
    } else {
      this.log.warn('piece moving without capturing.');
    }
    if(fromObj.type == 'cell'){
      fromObj.piece.sitOnto(toCell);
      fromObj.piece = null;
    } else if(fromObj.type == 'stand'){
      fromObj.removeByObj(piece);
      piece.sitOnto(toCell);
    }

    this.controller.reportActEnds(this.controller.playerInTurn(), movingPieceType, moveTo, capturedPieceType);
    
    this.log.goOut();
  },
	/**
	 * mateCheck(moveTo)
	 */
        // 現在の盤面で指した直後の、つまり手番ではないほうの
        // ライオンが詰んでいるかどうか判定する
        // 入力値：ライオンの位置
        // 返り値：詰んでいればtrue, いなければfalse
  mateCheck: function mateCheck(moveTo){ // AnimalShogiGame
    this.log.getInto('AnimalShogiGame#mateCheck');
    this.log.debug('lion at ' + moveTo.inspect() + ' is mated?');
    var ret = false;
    // 対象のライオンの位置
    var x = parseInt(moveTo[0]);
    var y = parseInt(moveTo[1]);
    var cell, piece;
    // 敵の駒(手番の駒) の利きにいるかどうか
      // x,yの周囲のマスに敵のコマがいたら
      // その駒の利きにx,yが含まれるか
    for(var i = -1; i < 2; i++){
      for(var j = -1; j < 2; j++){
        cell = this.board.getCell(x+i,y+j);
        if(cell){
          piece = this.board.getCell(x+i,y+j).piece;
          if(piece){
            this.log.debug('i,j,piece : ' + i + ', ' + j + ', ' + piece.toDebugString());
            if(piece.isTurn() && (ret = piece.canMoveTo(x,y))){
              break;
            }
          }
        }
      }
      if(ret) break;
    }
    this.log.debug('leaving with : ' + ret);
    this.log.goOut();
    return ret;
  },
	/**
	 * checkFinish()
	 */
        // 指し手についての情報をうけとり、それを指したplayerが勝ったかどうか判定する
        // 返り値：どちらかが勝ちだったら勝ったplayerのオブジェクトを返す 
        //         勝負がついていなければnullを返す
  checkFinish: function checkFinish(player, movingPieceType, moveTo, capturedPieceType){ // AnimalShogiGame
    this.log.getInto('AnimalShogiGame#checkFinish');
    var opponent_player = (player.name == this.controller.player1.name) ? this.controller.player2 : this.controller.player1;
    this.log.debug('opponent_player : ' + opponent_player.toDebugString());
    var ret = null;
    // ライオンが詰んでいるかどうか
    // var mated = (movingPieceType == 'lion') ? this.mateCheck(moveTo) : false;
    // 相手のライオンを捕獲したかどうか
    var getLion = (capturedPieceType == 'lion');
    // ライオンが動いたかどうか
    var isLion = (movingPieceType == 'lion');
    // 最奥に到達したかどうか
    var reachEnd = (this.controller.getTurn() && (moveTo[1] == 1)) || (!this.controller.getTurn() && (moveTo[1] == 4));
    // 勝利判定
    if (getLion){
      ret = player;
    } else {
      if (isLion && reachEnd){
        if(this.mateCheck(moveTo)){
          ret = opponent_player;
        } else {
          ret = player;
        } 
      }
    }
    this.log.warn('checkFinish leaving with : ' + ret);
    this.log.goOut();
    return ret;
  },
	/**
	 * debug_dump()
	 */
  debug_dump: function debug_dump(){ //AnimalShogiGame
    this.log.getInto({ "background":"#ff88aa","font-size":"12px" });
    this.log.warn('debug_dump enterd', {'indent':2});
    try{
      var state = wave.getState();
    } catch(e){
      this.log.error('cannot get state : ' + e);
    }
    if(state)
      this.log.warn(state.toString());
    else
      this.log.error('state is null');
    var obj = {};
    obj['all pieces']    = this.allPieces().length;
    obj['player1']	 = (this.player1 ? this.player1.toDebugString():null);
    obj['player2']	 = (this.player2 ? this.player2.toDebugString():null);
    obj['playingViewer'] = (this.playingViewer ? this.playingViewer.toDebugString():null);
    obj['top']		 = this.controller.top;
    //obj['board']	 = this.board.toDebugString();
    obj['board']	 = this.board.toString();
    obj['blackStand']	 = this.blackStand.toString();
    obj['whiteStand']	 = this.whiteStand.toString();
    //obj['Cell']	 = Cell.all.invoke('toDebugString').join('<br>');
    obj['PieceOnBoard']	 = '<br>' + this.board.cells.flatten().findAll(function(c){ return c.piece != null; }).invoke('toDebugString').join('<br>');
    obj['PieceOnBlackStand']	 = '<br>' + this.blackStand.elm.childElements().pluck('obj').invoke('toDebugString').join('<br>');
    obj['PieceOnWhiteStand']	 = '<br>' + this.whiteStand.elm.childElements().pluck('obj').invoke('toDebugString').join('<br>');
    obj['Droppables']	= Droppables.toDebugString();
    obj['Draggables']	= Draggables.toDebugString();
    for(var p in obj){
      this.log.warn(p + ' : ' + obj[p]);
    }
    this.log.warn('leaving debug_dump', {'indent':-2});
    this.log.goOut();
  }
});

/**
 * common functions
 */
	/**
	 * moveValidate(actionContents)
	 */
        // actionの正当性を判断して返す
        // actionContents : [piece, fromObj, toCell]
        // 返り値 :'needConfirm' ユーザconfirmを求める手だという意味 
        // 返り値 :'badAction' ルールにそわない手だという意味 
        // 返り値 :'normal' ルールにそい、そのまま進めてよい手だという意味 
function moveValidate(actionContents){
  window.gameController.log.getInto('moveValidate');
  var piece = actionContents[0];
  var fromCell = actionContents[1];
  var toCell = actionContents[2];
  var ret = 'normal';
  window.gameController.log.debug('piece : ' + piece.toDebugString());
  window.gameController.log.debug('fromCell : ' + fromCell.toDebugString());
  window.gameController.log.debug('toCell : ' + toCell.toDebugString());
  for(;;){
    if (toCell.piece) {
      if (piece.isBlack() == toCell.piece.isBlack()){
        window.gameController.log.debug('piece.isBlack() : ' + piece.isBlack());
        window.gameController.log.debug('toCell.piece : ' + toCell.piece.toDebugString());
        window.gameController.log.debug('toCell.piece.isBlack() : ' + toCell.piece.isBlack());
        window.gameController.message(t('cannot_capture_yourown_piece')); ret = 'badAction';
        break;
      }
    }
    window.gameController.game.log.debug('own capturing check passed.');
    if(!fromCell && toCell.piece) {
      window.gameController.message(t('already_occupied')); ret = 'badAction';
      break;
    }
    window.gameController.game.log.debug('put piece on filled cell check passed.');
    if (!piece.canMove(fromCell, toCell)) {
      window.gameController.message(t('not_allowed')); ret = 'badAction';
      break;
    }
    window.gameController.log.debug('illegal move check passed.');
    if (promoteCheck(actionContents)){
      ret = 'needConfirm';
      break;
    }
    window.gameController.log.debug('this move not require promotion.');
    break;
  }
  window.gameController.log.debug('returning with : ' + ret);
  window.gameController.log.goOut();
  return ret;
}

	/**
	 * promoteCheck(actionContents)
	 */
        // 成ることができるコマの動き方ならtrueを返し
        // そうでないならfalseを返す
function promoteCheck(actionContents){
  window.gameController.log.getInto('promoteCheck');
  var ret = false;
  var piece = actionContents[0];
  var player = piece.isBlack() ? window.gameController.player1 : window.gameController.player2;
  var fromCell = actionContents[1];
  var toCell = actionContents[2];
  for(;;){
    if (piece.type != 'chick'){
      ret = false;
      break;
    }
    if (toCell.isOpponentFirstLine(player)){
      ret = true;
      break;
    }
    break;
  } 
  window.gameController.log.goOut();
  return ret;
}
