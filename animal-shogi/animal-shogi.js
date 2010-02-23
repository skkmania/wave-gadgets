HOST = 'http://skkmania.sakura.ne.jp/animal-shogi/';
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

function addDraggable(piece, startMessage, game){
  game.log.debug('entered addDraggable: ' + startMessage);
      new Draggable(piece.elm, {
        onStart: function() {
          game.log.warn(startMessage);
        },
        onEnd: function() {
          this.elm.style.top = 0;
          this.elm.style.left = 0;
        }.bind(piece)
      });
}

function arrange(state){
  var str = state.toString();
  var pattern = /\w: '.*'\,/;
  var ret = str.replace(/\n/g, "<br>");
  return '<div style="color: #FF0000">' + ret + '</div>';
}

Number.prototype.toKanji = function(){
  var stock = ['','一','二','三', '四','五', '六','七', '八','九']
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
     this.game.log.warn('start reverse cp'); 
      if (this.game.top == 1){                                                
        this.player1Elm = $('top-panel');
        this.player2Elm = $('bottom-panel');
      } else {       
        this.player2Elm = $('top-panel');
        this.player1Elm = $('bottom-panel');
      }                    
    this.player1Elm.innerHTML = t('sente') + (this.game.player1 ? this.game.player1.statusHtml() : t('waiting'));
    this.player2Elm.innerHTML = t('gote') +  (this.game.player2 ? this.game.player2.statusHtml() : t('waiting'));

    if ($('my-captured').childElements().size() > 0 ||
        $('opponent-captured').childElements().size() > 0) {
       var tmp = $('top-captured').innerHTML;
       $('top-captured').innerHTML = $('bottom-captured').innerHTML;
       $('bottom-captured').innerHTML = tmp;
       $$('#top-captured img').invoke('addClassName', 'top');
       $$('#top-captured img').invoke('removeClassName', 'bottom');
       $$('#bottom-captured img').invoke('addClassName', 'bottom');
       $$('#bottom-captured img').invoke('removeClassName', 'top');
    }
    this._addDrag();
    this.game.log.warn('end'); 
  }, 
	/**
	 * _addDrag()
	 */
  _addDrag: function() {
window.game.log.warn('enterd _addDrag');
    if(this.game.myPlayer){
      // viewerかつplayer側のpieceにDraggableを追加する
      Pieces.each(function(piece){
        // cellのないpieceが持ち駒。盤上の駒にはすでにDraggableがあるのでさわらない
        if(!piece.cell && piece.player == this.game.myPlayer)
          addDraggable(piece,'drag started 00 cp _addDrag');
      });
    }
    // 上のifに合致しない->このviewerはplayerに非ずDraggableは必要ない
  },
	/**
	 * update()
	 */
  update: function() { // ControlPanel             
    this.game.determineTop();
     this.game.log.warn('cp update entered. top is ' + this.game.top); 
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

Pieces = $A();

/**
 * Piece Class
 */
Piece = Class.create({
	/**
	 * initialize(chr)
	 */
  initialize: function(chr, game, globe) {
    this.game = game;
game.log.warn('Piece#initialize entered with : ' + chr);
    this.type = Chr2Type[chr.toLowerCase()];
    this.isBlack = (chr.toUpperCase() == chr);
game.log.warn('Piece#initialize type is : ' + this.type);
    Object.extend(this, PieceTypeObjects[this.type]);
game.log.warn('Piece#initialize imageUrl is : ' + this.imageUrl);
    if(game.player1 && game.player2)
      this.player = (chr.toLowerCase() == chr)? game.player2:game.player1;
    Pieces.push(this);
game.log.warn('size of Pieces: ' + Pieces.size());
    this.name = this.type + '_' + (chr.toLowerCase() == chr)? 'player2':'player1';
game.log.warn('Piece#initialize name is : ' + this.name);
    this.cell = null;
    this.chr = chr;
    this.createElm(game);
    if (this.player && this.isViewersP(game)) {
      addDraggable(this,'Draggable when initialize', game);
    }
game.log.warn('leaving Piece#initialize'); 
  },
	/**
	 * createElm()
	 */
  createElm: function(game) {  // Piece
game.log.warn('Piece#createElm entered : ');
    this.elm = document.createElement('img');
    this.elm.obj = this;
    this.elm.src = this.imageUrl;
    this.elm.id = this.name;
    this.elm.addClassName('piece');
    if (!this.atTop(game)) {
      this.elm.addClassName('bottom');
      this.elm.removeClassName('top');
    }
    else {
      this.elm.removeClassName('bottom');
      this.elm.addClassName('top');
    }
game.log.warn('leaving Piece#createElm : ');
  },
	/**
	 * initialArrange(board)
	 */
  initialArrange: function(board) {  // Piece
window.game.log.warn('entered piece initialArrange : ');
    var pos = this.initialPosition;
    var atTop = this.player.atTop();
window.game.log.warn('piece initialArrange : name -> ' + this.name + ',  atTop : ' + atTop + ',  pos : ' + pos.toString());
window.game.log.warn('piece initialArrange : player.id -> ' + this.player.id);
    if (this.player.id == 'player2') pos = [4 - pos[0], 5 - pos[1]];
window.game.log.warn('piece initialArrange after corrected : ' + this.name + ',  atTop : ' + atTop + ',  pos : ' + pos.toString());
    board.cells[pos[1]][pos[0]].put(this);
  },
	/**
	 * setPlayer(player)
	 */
  setPlayer: function(player) { // Piece
    this.player = player;
if (window.game) window.game.log.warn('piece setPlayer entered: ' + this.name + ',  atTop : ' + this.atTop() + ',  this.elm.classname: ' + this.elm.className);
    if (!this.atTop()) {
      this.elm.addClassName('bottom');
      this.elm.removeClassName('top');
    }
    else {
      this.elm.removeClassName('bottom');
      this.elm.addClassName('top');
    }
if (window.game) window.game.log.warn('leaving piece setPlayer : ' + this.name + ',  atTop : ' + this.atTop() + ',  this.elm.classname: ' + this.elm.className);
  },
	/**
	 * getChr()
	 */
  getChr : function(){ // Piece
    return this.player.id == 'player1' ?
            Type2chr[this.type].toUpperCase() :
            Type2chr[this.type];
  },
	/**
	 * atTop()
	 */
  atTop: function(game){ // Piece
    return (this.game.top == 1) == this.isBlack;
  },
	/**
	 * capturedBy(player) 
	 */
  capturedBy: function(player) { // Piece
window.game.log.warn('entered Piece.capturedBy: ' + this.name + ' is captured by ' + player.id);
    this.setPlayer(player);
    this.cell.piece = null;
    this.cell = null;
    if (this.becomeNormal) this.becomeNormal();

    if (this.isViewersP()) {
      if (window.game.isPlayer()) {
window.game.log.warn('adding Draggable in captureBy piece: ' + this.toDebugString());
        addDraggable(this, 'drag started 03 piece capturedBy');
      }
      $('my-captured').appendChild(this.elm);
window.game.log.warn(this.elm.id + ' was appended to my-captured Piece#captured');
    }
    else {
      $('opponent-captured').appendChild(this.elm);
window.game.log.warn(this.elm.id + ' was appended to opponent-captured Piece#captured');
    }
  },
	/**
	 * canMove(fromCell, toCell)
	 */
  canMove: function(fromCell, toCell) { // Piece
window.game.log.warn('canMove entered.');
    if (!fromCell) return true; // 打ち駒はどこでもOK
    var dx = toCell.x - fromCell.x;
    var dy = toCell.y - fromCell.y;
    //var dx = fromCell.x - toCell.x;
    //var dy = fromCell.y - toCell.y;
window.game.log.warn('from: ' + fromCell.toDebugString() + ', to: ' + toCell.toDebugString());
window.game.log.warn('dx: ' + dx + ', dy: ' + dy);
    if (1 < Math.abs(dx) || 1 < Math.abs(dy)) return false;
    if (this.player.id == 'player2') dy *= -1;
window.game.log.warn('leaving with: ' + this.movableArea[dy + 1][dx + 1]);
    return this.movableArea[dy + 1][dx + 1];
  },
	/**
	 * move(fromCell, toCell, notCapture, dropOrState)
	 */
  move: function(fromCell, toCell, notCapture, dropOrState) {  // Piece
window.game.log.warn('Piece#move 1 : ');
    var capturedPiece = null;
    if(fromCell) fromCell.remove(this);
window.game.log.warn('Piece#move 2 : ');
    capturedPiece = toCell.replace(this);
window.game.log.warn('Piece#move 3 : ');
    return capturedPiece;
  },
	/**
	 * isViewersP()
	 */
  isViewersP: function(game) { // Piece
game.log.warn('leaving isViewersP.');
game.log.warn('player: ' + this.player.name + ', viewer: ' + wave.getViewer().getId());
    return this.player.name == wave.getViewer().getId();
  },
	/**
	 * isGoal(cell)
	 */
  isGoal: function(cell) { // Piece
window.game.log.warn('entered Piece#isGoal: player.id is ' + this.player.id);
    return ( this.player.id == 'player1' ? (cell.y === 1) : (cell.y === 4) );
  },
	/**
	 * toString()
	 */
  toString: function() { // Piece
    var ret = this.player.id + ',';
    var parentElm = this.elm.parentNode;
// このような大事な処理をtoStringなどという関数の中で行うのはよくない
    if (this.cell) {
      var xy = window.game.upsideDownIfNeeded(this.cell.x, this.cell.y);
      ret += xy[0] + ',' + xy[1];
    }
window.game.log.warn('leaving Piece#toString with : ' + ret);
    return ret;
  },
	/**
	 * toDebugString()
	 */
  toDebugString: function() {  // Piece
    var ret = 'name:<span style="color: #3F8080">' + this.name + '</span>, ';
    if(this.player) ret += ('player_id:' + this.player.id + ', ');
    if (this.cell && this.cell.elm) ret += ('cell_name:' + this.cell.elm.id);
    else ret += '[no cell]';
    ret += (', cn: ' + this.elm.className);
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
  initialPosition: [2, 4],
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
  initialPosition: [1, 4],
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
  initialPosition: [3, 4],
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
  initialPosition: [2, 3],
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
    if(this.piece.isBlack)
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
this.game.log.warn('Cell#put leaving');
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
        var fromCell = draggable.parentNode.obj;
        if(fromCell.type && fromCell.type == 'stand') fromCell = null;
        var toCell = this;
window.game.log.warn('<span style="color:#888800">onDrop called.</span>');
if(fromCell) window.game.log.warn('from: ' + fromCell.toDebugString());
if(toCell) window.game.log.warn(', to: ' + toCell.toDebugString());
        var piece = draggable.obj;

        if (!moveValidate(piece, fromCell, toCell)) return;
window.game.log.warn('canMove passed.');
        var capturedPiece = null;
        if (toCell.piece){
          if (piece.player == toCell.piece.player) {
            window.game.message(t('cannot_capture_yourown_piece')); return;
          } else {
window.game.log.warn('piece moving and capturing.');
            capturedPiece = piece.move(fromCell, toCell, false, 'onDrop');
window.game.log.warn('piece moved and captured is : ' + capturedPiece.toDebugString());
          }
        } else {
window.game.log.warn('piece moving without capturing.');
          piece.move(fromCell, toCell, true, 'onDrop');
        }

        if (checkFinish(capturedPiece, piece, toCell))
          window.game.finish(piece.player);
        else 
          window.game.nextTurn();
        sendDelta(piece, capturedPiece);
      }.bind(this)
    });
  },
	/**
	 * show()
	 */
  show: function() { // Cell
window.game.log.warn('entered show of Cell: ' + this.toDebugString());
    if (!this.elm) {
      (this.x === 0 || this.y === 0) ? this.createDummyElm() : this.createElm();
    }
    if (this.piece) {
window.game.log.warn('in show of Cell, processing -> ' + this.piece.toDebugString());
      this.elm.appendChild(this.piece.elm);
      if(this.piece.isBlack){
        if(window.game.top === 0){
          this.piece.elm.addClassName('bottom');
          this.piece.elm.removeClassName('top');
        } else {
          this.piece.elm.addClassName('top');
          this.piece.elm.removeClassName('bottom');
        }
      } else {
        if(window.game.top === 0){
          this.piece.elm.addClassName('top');
          this.piece.elm.removeClassName('bottom');
        } else {
          this.piece.elm.addClassName('bottom');
          this.piece.elm.removeClassName('top');
        }
      }
window.game.log.warn('in show of Cell, after process -> ' + this.piece.toDebugString());
    }
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
	/**
	 * remove(piece)
	 */
  remove: function(piece){  // Cell
window.game.log.warn('Cell#remove 1');
if(this.piece)window.game.log.warn('this cell.piece : ' + this.piece.toDebugString());
window.game.log.warn('arguments piece : ' + piece.toDebugString());
    piece.cell = null;
    if(this.piece){ this.elm.removeChild(this.piece.elm);
window.game.log.warn('Cell#remove 2');
    }
    this.piece = null;
  },
	/**
	 * replace(newPiece)
	 */
  replace: function(newPiece){  // Cell
    var tmp = null;
    if(this.piece){
      tmp = this.piece;
      this.piece.player = newPiece.player;
      newPiece.player.stand().put(this.piece);
      this.piece = null;
    }
    this.piece = newPiece;
    this.put(newPiece);
if (tmp) window.game.log.warn('leaving Cell#replace with : ' + tmp.toDebugString());
    return tmp;
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
    if(this.piece) ret += ', piece: ' + this.piece.name;
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
      var p = new Piece(chr, game, window);
      game.log.warn('piece: ' + p.toDebugString());
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
    this.game.log.info('Board#idx2xy returning with : ' + (idx%h + 1.0) + ', ' + (idx+1)%h);
    return [Math.floor(idx/h) + 1.0, idx%h + 1.0]
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
    var cell = this.getCellByIdx(idx);
    if(cell.piece){
      if(cell.piece.chr == chr){
        // do nothing
      } else {
        cell.remove();
        cell.put(new Piece(chr));
      }
    } else {
      cell.put(new Piece(chr));
    }
  },
	/**
	 * remove(idx)
	 */
  remove: function(idx){ // Board
    var cell = this.getCellByIdx(idx);
    if(cell.piece){
      cell.remove();
    } else {
      // do nothing
    }
  },
	/**
	 * replace(pair, idx)
	 */
  replace: function(pair, idx){ // Board
    var cell = this.getCellByIdx(idx);
    if(cell.piece){
      cell.replace(new Piece(pair[0]));
    } else {
      cell.put(new Piece(pair[0]));
    }
  },
	/**
	 * read(strFromState)
	 */
  read: function(strFromState){ // Board
    this.game.log.warn('entered Board#read with : ' + strFromState);
    // stateから読んだ文字列を元に駒を盤上に置く
    // 現在の状態との差分を埋める
    var oldBoard = $A(this.toString());
    var newBoard = $A(strFromState);
    newBoard.zip(oldBoard).each(function(tuple, idx){
        if(tuple[0] != tuple[1]){
           if(tuple[1] == 'x') this.put(tuple[0], idx);
           else if(tuple[0] == 'x') this.remove(idx);
           else this.replace(tuple, idx);
        }
      }.bind(this));
  },
	/**
	/**
	 * toString()
	 */
  toString: function(){ // Board
    game.log.warn('entered Board#toString');
    // stateに載せる文字列を返す
    var ret = '';
    for (var c = 1; c < this.game.width; c++) {
      for (var r = 1; r < this.game.height; r++) {
game.log.warn('start check at r: ' + r + ', c : ' + c);
if(this.cells && this.cells[r] && this.cells[r][c])
        ret += this.cells[r][c].say();
else
  game.log.warn('no cell at r: ' + r + ', c : ' + c);
      }
    }
    game.log.warn('leaving Board#toString with : ' + ret);
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
        if (c.piece.player.id == 'player1') {
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
	 * remove(chr)
	 */
  remove: function(chr){  // Stand
    // chrで指定された駒を駒台から取り除く
    // 取り除いたpieceを返す
    var target = this.pieces.find(function(p){ return p.chr == chr; });
    this.elm.removeChild(target.elm);
    return target;
  },
	/**
	 * put(piece)
	 */
  put: function(piece){  // Stand
    this.pieces.push(piece);
  },
	/**
	 * read(str)
	 */
  read: function(strFromState){ // Stand
    // stateから読んだ文字列を元に駒を駒台に置く
    // strFromStateが空文字列ならclearして終わり
    if (strFromState.length == 0){  this.pieces.clear(); return; }
    // 現在のstandの状態との差分を埋める
    var str_now = this.toString();
    // 現在にあり、strFromStateにないものは現在から消す
    var deleteCandidate = str_now.subtract(strFromState);
    $A(deleteCandidate).each(function(c){
      this.remove(c);
    }.bind(this));  
    // 現在になく、strにあるものは現在へ足す
    var addCandidate = strFromState.subtract(str_now);
    $A(addCandidate).each(function(c){
      this.put(createPiece(c));
    }.bind(this));
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
    this.game.log.warn('entered Stand#put : ' + this.id);
    this.pieces.push(piece);
    piece.cell = null;
    this.elm.appendChild(piece.elm);
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
      ret += this.pieces.map(function(p){ return Type2chr[p.type]; }).join('');
    this.game.log.debug('leaving Stand#toString with : ' + ret);
    return ret;
  },
	/**
	 * toDebugString()
	 */
  toDebugString: function(){ // Stand
    var ret = '';
    ret += 'pieces.size: ' + this.pieces.size();
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
  initialize: function(id, name, mine ) {
    this.id = id;
    this.name = name;
    this.mine = mine;
    this.isViewer = mine;
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
	 * initialArrange(board)
	 */
  initialArrange: function(board) { // Player
window.game.log.warn('entered initialArrange of Player');
window.game.log.warn(this.id + ': ' + this.name);
//window.game.log.warn('pieces: ' + this.pieces.invoke('toDebugString').join('<br>'));
//    this.pieces.each(function(piece) {
//      piece.initialArrange(board);
//    });
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
  toDebugString: function() {
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
    this.log.warn('start log');
    this.width = 4;  // 0 is dummy
    this.height = 5;
    this.settings = settings;
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
this.log.debug('entered Game#determineTop : ');
     // 先手(player1)がbottomのとき0, top = 1 なら先手がtop
     // はじめからtop が１になるのはplayer2がviewerのときだけ
     // あとはviewerが反転ボタンで指定したとき
    if (this.top_by_viewer){
       this.top = this.top_by_viewer;
    } else {
      this.top = 0;  // by default
this.log.info('this.top : ' + this.top);
      if (this.player2){
this.log.info('06.5 this.top is ' + this.top);
        if (this.player2.name == wave.getViewer().getId()){
this.log.info('06.6');
          this.top = 1;
        }
this.log.info('after 06.5 this.top : ' + this.top);
      }
   }
if (this.player2) this.log.warn('leaving determineTop: player2.name : ' + this.player2.name + ',  viewer.id : ' + wave.getViewer().getId() + ',  top : ' + this.top);
  },
	/**
	 * setPlayer(name, opponent)
	 */
        // GameのsetPlayerが呼ばれるのはjoinボタンが押されたときだけ
  setPlayer: function(name, opponent) { // Game
    if (!this.player1) {
      this.player1 = new Player('player1', name, !opponent);
      if (!opponent) this.myPlayer = this.player1;
      this.turn = this.player1;
      this.controlPanel.update();
      this.message(t('waiting'));
      wave.getState().submitDelta({
        player1:name
      });
    }
    else if (!this.player2) {
      if (name != this.player1.name){
        this.player2 = new Player('player2', name, !opponent);
        if (!opponent) this.myPlayer = this.player2;
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
    tmp = $('top-stand').innerHTML;
    $('top-stand').innerHTML = $('bottom-stand').innerHTML;
    $('bottom-stand').innerHTML = tmp;
    this.controlPanel.reverse();
  },
	/**
	 * start()
	 */
  start: function() {
    this.log.warn('game.start was called.');
    this.player1.initialArrange(this.board);
    this.log.warn('initialArrange of player 1 has ended: ');
    //this.log.warn('initialArrange of player 1 has ended: ' + this.player1.toDebugString());
    this.player2.initialArrange(this.board);
    this.log.warn('initialArrange of player 2 has ended: ');
    //this.log.warn('initialArrange of player 2 has ended: ' + this.player2.toDebugString());
    this.determineTop();
    this.controlPanel.update();
    this.board.show();
    this.log.warn('leaving game.start.');
  },
	/**
	 * nextTurn()
	 */
  nextTurn: function() {
    if (this.turn == this.player1) {
      this.turn = this.player2;
    }
    else if (this.turn == this.player2) {
      this.turn = this.player1;
    }
    this.controlPanel.update();
    this.clearMessage();
this.log.warn('leaving nextTurn');
  },
	/**
	 * getTurn()
	 */
  getTurn: function() {
    // turnは論理値。countが偶数ならtrueで先手番、奇数ならfalseで後手番。
    return (this.count % 2 == 0);
  },
	/**
	 * isViewersTurn()
	 */
  isViewersTurn: function() {
    return this.turn.name == wave.getViewer().getId();
  },
	/**
	 * needUpsideDown()
	 */
  needUpsideDown: function() {
this.log.warn('entered needUpsideDown. now, myPlayer is ' + this.myPlayer + ', this.top is ' + this.top + ', player1 is ' + this.player1 + ', player2 is ' + this.player2);
    if(this.myPlayer){
      if(this.top === 0)
        return  this.myPlayer.name == this.player2.name;
      else
        return  this.myPlayer.name == this.player1.name;
    } else {
      return false;
    }
  },
	/**
	 * upsideDownIfNeeded(x, y)
	 */
  upsideDownIfNeeded: function(x, y) {
this.log.warn('entered upsideDownIfNeeded : x, y -> ' + x + ', ' + y);
    x = parseInt(x);
    y = parseInt(y);
    if (this.needUpsideDown()) {
this.log.warn('---leaving with data converted : x, y -> ' + (4-x) + ', ' + (5-y));
      return [4 - x, 5 - y];
    }
    else {
this.log.warn('---leaving without change : x, y -> ' + x + ', ' + y);
      return [x, y];
    }
  },
	/**
	 * isSafety(piece)
	 */
  isSafety: function(piece) {
    // TODO
    return true;
  },
	/**
	 * isPlayer()
	 */
  isPlayer: function() {
    var viewer = wave.getViewer().getId();
    return this.player1.name == viewer || this.player2.name == viewer;
  },
	/**
	 * finish(winner)
	 */
  finish: function(winner) {
    this.message(winner.shortName() + t('win'));
    this.turn = null;
  },
	/**
	 * stateChanged()
	 */
  stateChanged: function() {
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
	 * toJSON()
	 */
  toJSON: function() {
    var ret = {};
    if (this.player1) ret.player1 = this.player1.toString();
    if (this.player2) {
      ret.player2 = this.player2.toString();
      Pieces.each(function(piece) {
        ret[piece.name] = piece.toString();
      });
      if (this.turn) ret.turn = this.turn.id;
    }
    ret.result = '';
    return ret;
  },
	/**
	 * processPlayer(state)
	 */
  processPlayer: function(state){
    var viewer = wave.getViewer().getId();
    var pl1 = state.get('player1');
    var pl2 = state.get('player2');
this.log.warn('entered processPlayer: viewer: ' + viewer);
    if (!this.player1 && pl1) {
this.log.warn('processPlayer: processing Player1: ');
      var isMe = (pl1 == viewer);
      this.top = (isMe ? 0 : 1);
      this.player1 = new Player('player1', pl1, isMe, this.top);
      this.controlPanel.update();
this.log.info('leaving processing Player1: ');
    }
    if (!this.player2 && pl2) {
this.log.warn('processPlayer: processing Player2: ');
      var isMeMaybe = (pl1 != viewer);
      this.top = (pl2 == viewer ? 1 : 0);
      this.player2 = new Player('player2', pl2, isMeMaybe, this.top);
this.debug_dump();
      this.controlPanel.update();
this.log.warn('backed into processPlayer: processing Player2: ');
      this.start();
this.log.warn('leaving processPlayer: processing Player2: ');
    }

    if (this.player1 && this.player1.name == viewer) {
      this.myPlayer = this.player1;
    }
    else if (this.player2 && this.player2.name == viewer) {
      this.myPlayer = this.player2;
    }
    this.determineTop();
this.log.warn('myPlayer is defined : ' + this.myPlayer);
    if (this.player1 && this.player2) {
      this.message('');
      $('join-button').hide();
    }
this.log.warn('leaving processPlayer: viewer: ' + viewer);
  },
	/**
	 * putPieceOnBoard(piece, x, y)
	 */
  putPieceOnBoard: function(piece, x, y){ // game
          var xy = this.upsideDownIfNeeded(x, y);
this.log.warn('data after upsideDown is  x: ' + xy[0] + ', y:' + y);
          // var xy = [x, y];
          var fromCell = piece.cell;
          var toCell = this.board.getCell(xy[0], xy[1]);
          if (fromCell != toCell) {
            piece.move(fromCell, toCell, true, 'fromState');
this.log.warn('put piece on board without capturing : ' + piece.toDebugString());
if(fromCell) this.log.warn(' moved from ' + fromCell.toDebugString());
if(toCell) this.log.warn(' to ' + toCell.toDebugString());
            this.nextTurn();
          }
  },
	/**
	 * sendPieceToStand(piece)
	 */
  sendPieceToStand: function(piece){
    // fromStateからのみ呼ばれる
    // pieceは持ち主の駒台におく
      this.log.warn('entered Game#sendPieceToStand: piece : ' + piece.toDebugString());
    if(piece.player.id == 'player1'){
      this.blackStand.put(piece);
    } else if(piece.player.id == 'player2'){
      this.whiteStand.put(piece);
    } else {
      this.log.warn('!! error !! Game#sendPieceToStand: this piece has no player! -> ' + piece.toDebugString());
    }
 
    this.log.warn('after Stand process');
    var prefix = 'my';
    var distination = 'black-stand'
    if (this.top == 1) {
      if (piece.player.id == 'player1'){
        prefix = 'opponent';
        distination = 'white-stand';
        piece.elm.addClassName('top');
        piece.elm.removeClassName('bottom');
      }
    } else {
      if (piece.player.id == 'player2'){
        prefix = 'opponent';
        distination = 'white-stand';
        piece.elm.addClassName('top');
        piece.elm.removeClassName('bottom');
      }
    }
    // まだこの時点ではpiece.cellにはinitialArrangeの情報が残ってしまっているので消す
    piece.cell = null;
    // $(prefix + '-captured').appendChild(piece.elm);
    $(distination).appendChild(piece.elm);
this.log.warn('piece:' + piece.name + ' was added to ' + prefix + '-captured in Game#sendPieceToStand');

    if (prefix == 'my' && this.isPlayer()) {
window.game.log.warn('adding Draggable in sendPieceToStand:');
      addDraggable(piece,'drag started 01 game sendPieceToStand'); 
    }
  },
	/**
	 * fromState(state)
	 */
  fromState: function(state) { // game
    this.log.warn('<span style="color:#00FFFF">entered fromState</span>');
    this.board.read(state.get('board', this.board.initialString));
    this.blackStand.read(state.get('bstand', this.blackStand.initialString));
    this.whiteStand.read(state.get('wstand', this.whiteStand.initialString));
    this.processPlayer(state);
    if (state.get('turn')) this.turn = this[state.get('turn')];
    if (!this.turn) this.turn = this.player1;
    this.controlPanel.update();
  },
	/**
	 * fromState_old(state)
	 */
  fromState_old: function(state) {
    this.log.warn('<span style="color:#00FFFF">entered fromState</span>');
    this.blackStand.clear();
    this.whiteStand.clear();
    this.processPlayer(state);
    if(!this.top_by_viewer) this.determineTop();
    var names = [
      'lion_player1', 'giraffe_player1', 'elephant_player1', 'chick_player1',
      'lion_player2', 'giraffe_player2', 'elephant_player2', 'chick_player2'
    ];
this.log.warn('<div style="color:#00FF00">fromState: entering the loop of all pieces:</div>');
this.log.warn('the length of names is ' + names.length);
this.log.warn('the array names is ' + names.join(':'));
    for (var i = 0; i < names.length; i++) {
this.log.warn('<div style="color:#0000FF">***** name from array is: ' + names[i] + ' *******</div>');
      var name = names[i];
      var piece = Pieces.find(function(e){ return e.name == name; })
      var pieceData = state.get(name); // owner,x,y
      if (piece){
this.log.warn('selected piece: ' + piece.toDebugString());
       if(pieceData) { // stateに情報がある駒

        pieceData = pieceData.split(',');
        var owner = this[pieceData[0]];
        var x = pieceData[1];
        var y = pieceData[2];
this.log.warn('this piece is on state:' + name + ', data:' + pieceData + ', owner:' + owner + 'data on state is  x:[' + x + '] y:[' + y + ']');

        piece.setPlayer(owner);
        if (x && (x !== '')) { // 盤上の駒
          this.putPieceOnBoard(piece, x, y);
        } else {  // captured
this.log.warn('captured piece calling sendPieceToStand : ' + piece.toDebugString());
          this.sendPieceToStand(piece);
        }
      } else {
this.log.warn('this piece is not on state:');
       // stateに情報がない駒 = 初期盤面から動いていない駒はinitialArrangeが済んでいる
      }
    }
    } // end of for
this.log.warn('fromState: went out of the loop of all pieces: ');
    if (state.get('turn')) this.turn = this[state.get('turn')];
    if (!this.turn) this.turn = this.player1;
    this.controlPanel.update();
this.log.warn('leaving fromState : ');
this.log.warn('Board#toString : ' + this.board.toString());
  },
	/**
	 * debug_dump()
	 */
  debug_dump: function(){
    this.log.warn('debug_dump enterd');
    var state = wave.getState();
    this.log.warn(state.toString());
    var obj = {};
    obj['player1']	 = (this.player1 ? this.player1.toDebugString():null);
    this.log.debug('00');
    obj['player2']	 = (this.player2 ? this.player2.toDebugString():null);
    this.log.debug('01');
    obj['top']		 = this.top;
    this.log.debug('02');
    obj['turn']		 = this.turn;
    this.log.debug('03');
    //obj['board']	 = this.board.toDebugString();
    obj['board']	 = this.board.toString();
    this.log.debug('04');
    obj['blackStand']	 = this.blackStand.toString();
    this.log.debug('05');
    obj['whiteStand']	 = this.whiteStand.toString();
    this.log.debug('06');
    //obj['Cell']	 = Cell.all.invoke('toDebugString').join('<br>');
    obj['Piece']	 = Pieces.invoke('toDebugString').join('<br>');
    this.log.debug('07');
    for(var p in obj){
      this.log.warn(p + ' : ' + obj[p]);
    }
  }
});

/**
 * common functions
 */
	/**
	 * sendDelta(pieces, capturedPiece)
	 */
function sendDelta(piece, capturedPiece){
   // 送信
   var delta = {};
   delta['board'] = window.game.board.toString();
   delta['bstand'] = window.game.blackStand.toString();
   delta['wstand'] = window.game.whiteStand.toString();
   delta['count'] = window.game.count.toString();

   if (capturedPiece) delta[capturedPiece.name] = capturedPiece.toString();
window.game.log.warn('<div style="color:#FF0000">sending delta : </div>' + delta.toString());
   wave.getState().submitDelta(delta);
}

	/**
	 * moveValidate(piece, fromCell, toCell)
	 */
function moveValidate(piece, fromCell, toCell){
window.game.log.warn('moveValidate entered: piece: ' + piece.toDebugString());
   if (!window.game.isViewersTurn()) {
     window.game.message(t('not_your_turn')); return false;
   }
window.game.log.warn('moveValidate 1');
   if (toCell.piece) {
     if (piece.player == toCell.piece.player){
       window.game.message(t('cannot_get_own_piece')); return false;
     }
   }
window.game.log.warn('moveValidate 2');
   if(!fromCell && toCell.piece) {
     window.game.message(t('already_occupied')); return false;
   }
window.game.log.warn('moveValidate 3');
   if (!piece.canMove(fromCell, toCell)) {
     window.game.message(t('not_allowed')); return false;
   }
window.game.log.warn('moveValidate 4');
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
	 * checkFinish(capturedPiece, piece, toCell)
	 */
function checkFinish(capturedPiece, piece, toCell){
          return (
          // 相手のライオンを捕獲
          (capturedPiece && capturedPiece.type == 'lion') || 
          // 自分のライオンが最奥に到達
          (piece.type == 'lion' && piece.isGoal(toCell) && window.game.isSafety(piece))
	  );
}
