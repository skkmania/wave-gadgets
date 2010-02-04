HOST = 'http://skkmania.sakura.ne.jp/shogi/';

function arrange(state){
  var str = state.toString();
  var pattern = /\w: '.*'\,/;
  var ret = str.replace(/\n/g, "<br>");
  return '<div style="color: #FF0000">' + ret + '</div>';
}

function sendDelta(piece, capturedPiece){
        // 送信
        var delta = {};
        delta['turn'] = window.game.getTurn().id;
        delta[piece.name] = piece.toString();
        if (capturedPiece) delta[capturedPiece.name] = capturedPiece.toString();
window.game.dw.dw('<div style="color:#FF0000">sending delta</div>');
        wave.getState().submitDelta(delta);
}

function moveValidate(piece, fromCell, toCell){

        if (!window.game.isViewersTurn()) {
          window.game.message(t('not_your_turn')); return false;
        }
        if (!fromCell && toCell.piece) {
          window.game.message(t('already_occupied')); return false;
        }
        if (!piece.canMove(fromCell, toCell)) {
          window.game.message(t('not_allowed')); return false;
        }
	return true;
}

function checkFinish(capturedPiece, piece, toCell){
          return (
          // 相手のライオンを捕獲
          (capturedPiece && capturedPiece.type == 'lion') || 
          // 自分のライオンが最奥に到達
          (piece.type == 'lion' && piece.isGoal(toCell) && window.game.isSafety(piece))
	  );
}

ControlPanel = Class.create({
  initialize: function(game) {
    this.game = game;
  },
  reverse: function() { // ControlPanel              
     this.game.dw.dw('start reverse cp'); 
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
    this.game.dw.dw('end'); 
  }, 
  _addDrag: function() {
window.game.dw.dw('enterd _addDrag');
    if(this.game.myPlayer){
      // viewerかつplayer側のpieceにDraggableを追加する
      Piece.all.each(function(piece){
        // cellのないpieceが持ち駒。盤上の駒にはすでにDraggableがあるのでさわらない
        if(!piece.cell && piece.player == this.game.myPlayer)
          new Draggable(piece.elm, {
              onStart: function() {
                window.game.dw.dw('drag started 00 cp _addDrag');
              },
            onEnd: function() {
              this.elm.style.top = 0;
              this.elm.style.left = 0;
            }.bind(piece)
          });
      });
    } else {
      // viewerはplayerではないのでなにもしない
    }
  },
  update: function() { // ControlPanel             
    this.game.determineTop();
     this.game.dw.dw('cp update entered. top is ' + this.game.top); 
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
     this.game.dw.dw('cp update leaving'); 
  } 
});

Piece = Class.create();
Piece.all = $A();
Piece.selectByName = function(name) {
  for (var i = 0; i < Piece.all.length; i++) {
    var piece = Piece.all[i];
//window.game.dw.dw('selectByName: ' + piece.toDebugString());
    if (piece.name == name) return piece;
  }
  return null;
};
// これは
// Piece.all.find(function(e){ return e.name == name; })
// とかけばよいのでは？ しかも1ヶ所でしかつかってないし。undefinedにしたくない、nullがいいという理由があるかどうかチェック。

Piece.prototype = {
  initialize: function(player) {
if(window.game) window.game.dw.dw('entered Piece#initialize: ' + this.type + '_' + player.id);
else
alert('window.game does not exist.');
    Piece.all.push(this);
    this.name = this.type + '_' + player.id;
    this.cell = null;
    this.elm = document.createElement('img');
    this.elm.obj = this;
    this.elm.src = this.imageUrl;
    this.elm.id = this.name;
    this.elm.addClassName('piece');
    this.setPlayer(player);
    if (this.isViewersP()) {
if(window.game) window.game.dw.dw('adding Draggable in Piece#initialize:' + this.toDebugString());
      new Draggable(this.elm, {
          onStart: function() {
            // alert('drag started 02 piece initialize');
          },
        onEnd: function() {
          this.elm.style.top = 0;
          this.elm.style.left = 0;
        }.bind(this)
      });
    }
  },
  initialArrange: function(board) {  // Piece
    var pos = this.initialPosition;
//    var atTop = this.player.atTop();
// window.game.dw.dw('piece initialArrange : ' + this.name + ',  atTop : ' + atTop + ',  pos : ' + pos.toString());
    if (this.player.id == 'player2') pos = [2 - pos[0], 3 - pos[1]];
// window.game.dw.dw('piece initialArrange after corrected : ' + this.name + ',  atTop : ' + atTop + ',  pos : ' + pos.toString());
    board.cells[pos[1]][pos[0]].put(this);
  },
  setPlayer: function(player) {
    this.player = player;
if (window.game) window.game.dw.dw('piece setPlayer entered: ' + this.name + ',  atTop : ' + this.atTop() + ',  this.elm.classname: ' + this.elm.className);
    if (!this.atTop()) {
      this.elm.addClassName('bottom');
      this.elm.removeClassName('top');
    }
    else {
      this.elm.removeClassName('bottom');
      this.elm.addClassName('top');
    }
if (window.game) window.game.dw.dw('leaving piece setPlayer : ' + this.name + ',  atTop : ' + this.atTop() + ',  this.elm.classname: ' + this.elm.className);
  },
  determineClassName: function(){
      if(this.player.id == 'player1'){
        if(window.game.top == 0){
          this.elm.addClassName('bottom');
          this.elm.removeClassName('top');
        } else {
          this.elm.addClassName('top');
          this.elm.removeClassName('bottom');
        }
      } else {
        if(window.game.top == 0){
          this.elm.addClassName('top');
          this.elm.removeClassName('bottom');
        } else {
          this.elm.addClassName('bottom');
          this.elm.removeClassName('top');
        }
      }
  },
  atTop : function(){ // Piece
    if (window.game.top == 1)
      return this.player.id == 'player1';
    else
      return this.player.id == 'player2';
  },
  capturedBy: function(player) { // Piece
window.game.dw.dw('entered Piece.capturedBy: ' + this.name + ' is captured by ' + player.id);
    this.setPlayer(player);
    this.cell.piece = null;
    this.cell = null;
    if (this.becomeNormal) this.becomeNormal();

    if (this.isViewersP()) {
    //if (this.isMine()) {
      if (window.game.isPlayer()) {
window.game.dw.dw('adding Draggable in captureBy piece: ' + this.toDebugString());
        new Draggable(this.elm, {
          onStart: function() {
            // alert('drag started 03 piece capturedBy');
          },
          onEnd: function() {
            this.elm.style.top = 0;
            this.elm.style.left = 0;
          }.bind(this)
        });
      }
      $('my-captured').appendChild(this.elm);
window.game.dw.dw(this.elm.id + ' was appended to my-captured Piece#captured');
    }
    else {
      $('opponent-captured').appendChild(this.elm);
window.game.dw.dw(this.elm.id + ' was appended to opponent-captured Piece#captured');
    }
  },
  canMove: function(fromCell, toCell) {
window.game.dw.dw('canMove entered.');
    if (!fromCell) return true; // 打ち駒はどこでもOK
    var dx = toCell.x - fromCell.x;
    var dy = toCell.y - fromCell.y;
    //var dx = fromCell.x - toCell.x;
    //var dy = fromCell.y - toCell.y;
window.game.dw.dw('from: ' + fromCell.toDebugString() + ', to: ' + toCell.toDebugString());
window.game.dw.dw('dx: ' + dx + ', dy: ' + dy);
    if (1 < Math.abs(dx) || 1 < Math.abs(dy)) return false;
//    if (!this.mine) dy *= -1;
window.game.dw.dw('leaving with: ' + this.movableArea[dy + 1][dx + 1]);
    return this.movableArea[dy + 1][dx + 1];
  },
  move: function(fromCell, toCell, notCapture, dropOrState) {  // Piece
window.game.dw.dw('move entered. piece: ' + this.toDebugString() + ', notCapture: ' + notCapture);
if(fromCell) window.game.dw.dw('from: ' + fromCell.toDebugString());
if(toCell) window.game.dw.dw(', to: ' + toCell.toDebugString());
    var capturedPiece = null;
    if (notCapture != undefined){
    if (!notCapture) {
      if (toCell.piece) {
window.game.dw.dw('there is captured piece: ' + toCell.piece.toDebugString());
        if (this.player == toCell.piece.player) throw t('cannot_get_own_piece');
        capturedPiece = toCell.piece;
        toCell.capturedBy(this.player);
      }
    }
    }

window.game.dw.dw('this.elm.id -> ' + this.elm.id);
window.game.dw.dw('this.elm.parentNode -> ' + this.elm.parentNode);
    this.elm.parentNode.removeChild(this.elm);
    toCell.elm.appendChild(this.elm);
    if (fromCell) {
      if(fromCell.piece.name == this.name){
        fromCell.piece = null;
window.game.dw.dw('piece of fromCell:' + fromCell.toDebugString() + ' was nulled.');
      } else {
      }
    }
window.game.dw.dw('this is to put to toCell: ' + toCell.toDebugString());
    toCell.put(this);
window.game.dw.dw('this was put to toCell: ' + toCell.toDebugString());
    if (dropOrState == 'onDrop' && fromCell && this.type == 'chick' && toCell.isOpponentFirstLine(this.player)) {
window.game.dw.dw('chick is becoming special');
      this.becomeSpecial();
    }
window.game.dw.dw('leaving move.');
if(capturedPiece) window.game.dw.dw('capturedPiece is ' + capturedPiece.toDebugString());
    return capturedPiece;
  },
  isViewersP: function() {
window.game.dw.dw('leaving isViewersP.');
window.game.dw.dw('player: ' + this.player.name + ', viewer: ' + wave.getViewer().getId());
    return this.player.name == wave.getViewer().getId();
  },
  isGoal: function(cell) { // Piece
window.game.dw.dw('entered Piece#isGoal: player.id is ' + this.player.id);
    return ( this.player.id == 'player1' ? (cell.y == 0) : (cell.y == 3) );
  },
  toString: function() { // Piece
    var ret = this.player.id + ',';
    var parentElm = this.elm.parentNode;
// このような大事な処理をtoStringなどという関数の中で行うのはよくない
    if (this.cell) {
      var xy = window.game.upsideDownIfNeeded(this.cell.x, this.cell.y);
      ret += xy[0] + ',' + xy[1];
    }
    return ret;
  },
  toDebugString: function() {  // Piece
    var ret = 'name:' + this.name + ', ';
    ret += ('player_id:' + this.player.id + ', ');
    if (this.cell && this.cell.elm) ret += ('cell_name:' + this.cell.elm.id);
    else ret += '[no cell]';
    ret += (', cn: ' + this.elm.className);
    return ret;
  }
}

Lion = Class.create(Piece, {
  imageUrl: HOST + 'lion.png',
  type: 'lion',
  initialPosition: [1, 3],
  movableArea: [
    [ true,  true,  true],
    [ true, false,  true],
    [ true,  true,  true]
  ]
});

Elephant = Class.create(Piece, {
  imageUrl: HOST + 'elephant.png',
  type: 'elephant',
  initialPosition: [0, 3],
  movableArea: [
    [ true, false,  true],
    [false, false, false],
    [ true, false,  true]
  ]
});

Giraffe = Class.create(Piece, {
  imageUrl: HOST + 'giraffe.png',
  type: 'giraffe',
  initialPosition: [2, 3],
  movableArea: [
    [false,  true, false],
    [ true, false,  true],
    [false,  true, false]
  ]
});

Chick = Class.create(Piece, {
  imageUrl: HOST + 'chick.png',
  type: 'chick',
  initialPosition: [1, 2],
  movableArea: [
    [false,  true, false],
    [false, false, false],
    [false, false, false]
  ],
  becomeSpecial: function() {
    this.imageUrl = HOST + 'chicken.png';
    this.type = 'chicken';
    this.movableArea = [
      [ true,  true,  true],
      [ true, false,  true],
      [false,  true, false]
    ];
    this.elm.src = this.imageUrl;
  },
  becomeNormal: function() {
    this.imageUrl = HOST + 'chick.png';
    this.type = 'chick';
    this.movableArea = [
      [false,  true, false],
      [false, false, false],
      [false, false, false]
    ];
    this.elm.src = this.imageUrl;
  }
});

Cell = Class.create();
Cell.all = $A();
Cell.prototype = {
  initialize: function(board, x, y, top) {
    Cell.all.push(this);
    this.board = board;
    this.x = x;
    this.y = y;
    this.top = top;
  },
  put: function(piece) {
    this.piece = piece;
    this.piece.cell = this;
  },
  move: function(toY,toX){
    var marginTop = 0;
    var marginLeft = 0;
    var width = 90;
    this.elm.style.left = (marginLeft + width * toX) + 'px';
    this.elm.style.top = (marginTop + width * toY) + 'px';
  },
  createElm: function() {  // Cell
    var marginTop = 0;
    var marginLeft = 0;
    var width = 90;

    this.elm = document.createElement('div');
    this.elm.id = 'cell-' + this.x + '-' + this.y;
    this.elm.obj = this;
    this.elm.addClassName('cell');
    var bw = window.game.board.width;
    var bh = window.game.board.height;
    if (window.game.top == 1){
      this.elm.style.left = (marginLeft + width *  this.x) + 'px';
      this.elm.style.top = (marginTop + width * (bh - 1 - this.y)) + 'px';
    } else {
      this.elm.style.left = (marginLeft + width * (bw - 1 - this.x)) + 'px';
      this.elm.style.top = (marginTop + width * this.y) + 'px';
    }
    this.board.elm.appendChild(this.elm);
window.game.dw.dw('Droppables to add ' + this.elm.id);
    Droppables.add(this.elm, {
      accept: 'piece',
      onDrop: function(draggable) {
        var fromCell = draggable.parentNode.obj;
        var toCell = this;
        window.game.dw.dw('<span style="color:#888800">onDrop called.</span>');
        if(fromCell) window.game.dw.dw('from: ' + fromCell.toDebugString());
        if(toCell) window.game.dw.dw(', to: ' + toCell.toDebugString());
        var piece = draggable.obj;
	if (!moveValidate(piece, fromCell, toCell)) return;
        var capturedPiece = null;
        if (toCell.piece){
          if (piece.player == toCell.piece.player) {
            window.game.message(t('cannot_capture_yourown_piece')); return;
          } else {
            window.game.dw.dw('piece moving and capturing.');
            capturedPiece = piece.move(fromCell, toCell, false, 'onDrop');
          }
        } else {
          window.game.dw.dw('piece moving without capturing.');
          piece.move(fromCell, toCell, true, 'onDrop');
        }

        if (checkFinish(capturedPiece, piece, toCell))
          window.game.finish(piece.player);
        else {
          window.game.dw.dw('ordinary turn change?');
          window.game.nextTurn();
        }

	sendDelta(piece, capturedPiece);
      }.bind(this)
    });
  },
  show: function() {
window.game.dw.dw('entered show of Cell: ' + this.toDebugString());
    if (!this.elm) {
      this.createElm();
    }
    if (this.piece) {
      this.elm.appendChild(this.piece.elm);
      this.piece.determineClassName();
    }
  },
  isOpponentFirstLine: function(player) {
    if (window.game.player1.id == player.id) {
      return this.y == 0;
    }
    else if (window.game.player2.id == player.id) {
      return this.y == 3;
    }
    else {
      throw 'not reach: ' + player.id;
    }
  },
  capturedBy: function(player) { // Cell
window.game.dw.dw('entered Cell.capturedBy: player is ' + player.toDebugString());
    this.elm.removeChild(this.piece.elm);
    this.piece.capturedBy(player);
    this.piece = null;
  },
  toArray: function() {
    return [this.x, this.y];
  },
  toJSON: function() {
    if (this.piece) {
      return this.piece.name;
    }
    else {
      return '';
    }
  },
  toDebugString: function(){  // Cell
    var ret = '';
    ret += '[' + this.x + ',' + this.y + ']';
    if(this.top) ret += ', top: ' + this.top;
    if(this.elm) ret += ', elm: ' + this.elm.id;
    if(this.piece) ret += ', piece: ' + this.piece.name;
    return ret;
  }
};

Board = Class.create({
  initialize: function(elm, game) {
    this.top = game.top;
    this.width = 9;
    this.height = 9;
    this.boardData = [];
    this.blackStand = '';
    this.whiteStand = '';
    this.elm = elm || document.body;
    this.cells = [];
    for (var r = 0; r < this.height; r++) {
      var row = [];
      for (var c = 0; c < this.width; c++) {
        row.push(new Cell(this, c, r, game.top));
      }
      this.cells.push(row);
    }
  },
  adjust: function() {
    if(!this.cells[0][0].elm) return;
    if(!window.game) return;
window.game.dw.dw('-------board.adjust entered--top is ' + window.game.top + '  --------------------------------');
    var marginTop = 0;
    var marginLeft = 0;
    var width = 50;
    if(window.game.top != 1){
      for (var r = 0; r < this.height; r++) {
        for (var c = 0; c < this.width; c++) {
          this.cells[r][c].elm.style.left =  (marginLeft + width * c) + 'px';
          //this.cells[r][c].elm.style.left =  (marginLeft + width * (this.width - 1 - c)) + 'px';
          this.cells[r][c].elm.style.top =  (marginLeft + width * r) + 'px';
          //this.cells[r][c].elm.style.top =  (marginLeft + width * (this.height - 1 - r)) + 'px';
        }
      }
    } else {
      for (var r = 0; r < this.height; r++) {
        for (var c = 0; c < this.width; c++) {
          this.cells[r][c].elm.style.left =  (marginLeft + width * (this.width - 1 - c)) + 'px';
          this.cells[r][c].elm.style.top =  (marginLeft + width * (this.height - 1 - r)) + 'px';
        }
      }
    }
  },
  show: function() {  // Board
    this.each(function(cell) {
      cell.show();
    });
window.game.dw.dw('leaving Board.show');
  },
  each: function(block) {
    for (var r = 0; r < this.height; r++) {
      for (var c = 0; c < this.width; c++) {
        block(this.cells[r][c], r, c);
      }
    }
  },
  getCell: function(x, y) {
    return this.cells[y][x];
  },
  toJSON: function() {
    var ret = '[';
    for (var r = 0; r < this.height; r++) {
      ret += '[';
      for (var c = 0; c < this.width; c++) {
        ret += this.cells[r][c].toJSON();
        if (this.cells[r][c+1]) ret += ',';
      }
      ret += ']';
      if (this.cells[r+1]) ret += ',';
    }
    ret += ']';
    return ret;
  },
  reverse: function(top) { // Board
window.game.dw.dw('reverse called.');
    this.cells.flatten().each(function(c){
window.game.dw.dw('reverse called. cell is ' + c.toDebugString());
      if (c.piece) {
window.game.dw.dw('reverse class name called. piece is ' + c.piece.toDebugString());
        if (c.piece.player.id == 'player1') {
          if (window.game.top ==  0){
            c.piece.elm.removeClassName('top');
            c.piece.elm.addClassName('bottom');
          } else {
            c.piece.elm.removeClassName('bottom');
            c.piece.elm.addClassName('top');
          }
        } else {
          if (window.game.top ==  0){
            c.piece.elm.removeClassName('bottom');
            c.piece.elm.addClassName('top');
          } else {
            c.piece.elm.removeClassName('top');
            c.piece.elm.addClassName('bottom');
          }
        }
window.game.dw.dw('reverse class name after process. ' + c.piece.toDebugString());
      }
    });
  },
  toDebugString: function(){
    var ret = '';
    for (var r = 0; r < this.height; r++) {
      for (var c = 0; c < this.width; c++) {
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

Player = Class.create({
  initialize: function(id, name, mine ) {
    this.id = id;
    this.name = name;
    this.mine = mine;
    this.isViewer = mine;
    this.pieces = [
      new Giraffe(this),
      new Lion(this),
      new Elephant(this),
      new Chick(this)
    ];
  },
  atTop: function(){
    if (this.id == 'player1')
      return (window.game.top == 1);
    else
      return (window.game.top != 1);
  },
  initialArrange: function(board) {
window.game.dw.dw('entered initialArrange of Player');
window.game.dw.dw(this.id + ': ' + this.name);
window.game.dw.dw('pieces: ' + this.pieces.invoke('toDebugString').join('<br>'));
    this.pieces.each(function(piece) {
      piece.initialArrange(board);
    });
  },
  shortName: function() {
    return this.name.split('@').first();
  },
  statusHtml: function() {
// playerのshort nameのspan のHTMLを返す。mine, turnのどちらかあるいは両方をclassとして指定する。
// classの意味（効果はcssで次のように定義されている。）
// mine は下線をひく
// turn は背景色を黄色にする
    var classNames = this.isViewer ? 'mine' : '';
    if (window.game.getTurn() == this) classNames += ' turn';
    return '<span class="' + classNames + '">' + this.shortName() + '</span>';
  },
  toString: function() { // Player
    return this.name;
  },
  toDebugString: function() {
    return 'Player: name: ' + this.name + ', isViewer: ' +  this.isViewer + ', atTop: ' + this.atTop() + ', ' + this.pieces.invoke('toDebugString').join(':'); 
  }
});

Stand = Class.create({
  initialize: function(game) {
  },
  display: function() {
  },
  update: function() {
  }
});

ShogiGame = Class.create({
  initialize: function(settings) {
    this.dw = new DebugWindow(this, 'debug 1');
    this.dw.dw('start info');
    this.settings = settings;
    this.container = $(settings.containerId);
    this.controlPanel = new ControlPanel(this);
    this.board = new Board(this.container, this);
    this.mode = 'init';
    this.message(t('click_join_button'));
    this.turn = null;
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
  },
  determineTop: function() {
     // 先手(player1)がbottomのとき0, top = 1 なら先手がtop
     // はじめからtop が１になるのはplayer2がviewerのときだけ
     // あとはviewerが反転ボタンで指定したとき
    if (this.top_by_viewer){
       this.top = this.top_by_viewer;
    } else {
      this.top = 0;  // by default
this.dw.dw('this.top : ' + this.top);
      if (this.player2){
this.dw.dw('06.5 this.top is ' + this.top);
        if (this.player2.name == wave.getViewer().getId()){
this.dw.dw('06.6');
          this.top = 1;
        }
this.dw.dw('after 06.5 this.top : ' + this.top);
      }
   }
if (this.player2) this.dw.dw('leaving determineTop: player2.name : ' + this.player2.name + ',  viewer.id : ' + wave.getViewer().getId() + ',  top : ' + this.top);
  },
  setPlayer: function(name, opponent) {
    if (!this.player1) {
      this.player1 = new Player('player1', name, !opponent);
      if (!opponent) this.myPlayer = this.player1;
      this.turn = this.player1
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
    else {
      // TODO
      //throw 'Invalid Player Data';
    }
  //  this.determineTop();
  },
  message: function(message) {
    if (!this.messageElm) {
      this.messageElm = $('message-body');
    }
    this.messageElm.innerHTML = message;
  },
  clearMessage: function() {
    this.message('');
  },
  show: function() {
this.dw.dw('game.show');
    //this.board.show();
  },
  reverse: function() {
    this.top = (this.top == 0 ? 1 : 0);
    this.top_by_viewer = this.top;
    this.message('game.top became ' + this.top);
this.dw.dw('1');
    this.board.reverse();
    this.board.adjust();
this.dw.dw('2');
    this.controlPanel.reverse();
this.dw.dw('3');
  },
  start: function() {
    this.dw.dw('game.start was called.');
    this.player1.initialArrange(this.board);
    this.dw.dw('initialArrange of player 1 has ended: ' + this.player1.toDebugString());
    this.player2.initialArrange(this.board);
    this.dw.dw('initialArrange of player 2 has ended: ' + this.player2.toDebugString());
    this.determineTop();
    this.controlPanel.update();
    this.board.show();
    this.dw.dw('leaving game.start.');
  },
  nextTurn: function() {
    if (this.turn == this.player1) {
      this.turn = this.player2;
    }
    else if (this.turn == this.player2) {
      this.turn = this.player1;
    }
    this.controlPanel.update();
    this.clearMessage();
this.dw.dw('leaving nextTurn');
  },
  getTurn: function() {
    if (!this.turn) this.turn = this.player1;
    return this.turn;
  },
  isViewersTurn: function() {
    return this.turn.name == wave.getViewer().getId();
  },
  needUpsideDown: function() {
this.dw.dw('entered needUpsideDown. now, myPlayer is ' + this.myPlayer + ', this.top is ' + this.top + ', player1 is ' + this.player1 + ', player2 is ' + this.player2);
    if(this.myPlayer){
      if(this.top == 0)
        return  this.myPlayer.name == this.player2.name;
      else
        return  this.myPlayer.name == this.player1.name;
    } else {
      return false;
    }
  },
  upsideDownIfNeeded: function(x, y) {
this.dw.dw('entered upsideDownIfNeeded : x, y -> ' + x + ', ' + y);
    x = parseInt(x);
    y = parseInt(y);
    if (this.needUpsideDown()) {
this.dw.dw('---leaving with data converted : x, y -> ' + (2-x) + ', ' + (3-y));
      return [2 - x, 3 - y];
    }
    else {
this.dw.dw('---leaving without change : x, y -> ' + x + ', ' + y);
      return [x, y];
    }
  },
  isSafety: function(piece) {
    // TODO
    return true;
  },
  isPlayer: function() {
    var viewer = wave.getViewer().getId();
    return this.player1.name == viewer || this.player2.name == viewer;
  },
  finish: function(winner) {
    this.message(winner.shortName() + t('win'));
    this.turn = null;
  },
  stateChanged: function() {
    var state = wave.getState();
this.dw.dw('stateChanged: ' + arrange(state));
    this.fromState(state);
this.dw.dw('leaving stateChanged:');
  },
  toString: function() { // Game
    var ret = '';
    var json = this.toJSON();
    for (var key in json) {
      ret += key + ' : ' + json[key] + '\n';
    }
    return ret;
  },
  toHTML: function() {
    var ret = '<table>';
    var json = this.toJSON();
    for (var key in json) {
      ret += '<tr><td>' + key + '</td><td>' + json[key] + '</td></tr>\n';
    }
    ret += '</table>';
    return ret;
  },
  toJSON: function() {
    var ret = {};
    if (this.player1) ret.player1 = this.player1.toString();
    if (this.player2) {
      ret.player2 = this.player2.toString();
      Piece.all.each(function(piece) {
        ret[piece.name] = piece.toString();
      });
      if (this.turn) ret.turn = this.turn.id;
    }
    ret.result = '';
    return ret;
  },
  processPlayer: function(state){
    var viewer = wave.getViewer().getId();
    var pl1 = state.get('player1');
    var pl2 = state.get('player2');
this.dw.dw('entered processPlayer: viewer: ' + viewer);
    if (!this.player1 && pl1) {
this.dw.dw('processPlayer: processing Player1: ');
      var isMe = (pl1 == viewer);
      this.top = (isMe ? 0 : 1);
      this.player1 = new Player('player1', pl1, isMe, this.top);
      this.controlPanel.update();
this.dw.dw('leaving processPlayer: processing Player1: ');
    }
    if (!this.player2 && pl2) {
this.dw.dw('processPlayer: processing Player2: ');
      var isMeMaybe = (pl1 != viewer);
      this.top = (pl2 == viewer ? 1 : 0);
      this.player2 = new Player('player2', pl2, isMeMaybe, this.top);
this.debug_dump();
      this.controlPanel.update();
this.dw.dw('backed into processPlayer: processing Player2: ');
      this.start();
this.dw.dw('leaving processPlayer: processing Player2: ');
    }

    if (this.player1 && this.player1.name == viewer) {
      this.myPlayer = this.player1;
    }
    else if (this.player2 && this.player2.name == viewer) {
      this.myPlayer = this.player2;
    }
    this.determineTop();
this.dw.dw('myPlayer is defined : ' + this.myPlayer);
    if (this.player1 && this.player2) {
      this.message('');
      $('join-button').hide();
    }
this.dw.dw('leaving processPlayer: viewer: ' + viewer);
  },
  putPieceOnBoard: function(piece, x, y){
          var xy = this.upsideDownIfNeeded(x, y);
this.dw.dw('data after upsideDown is  x: ' + xy[0] + ', y:' + y);
          // var xy = [x, y];
          var fromCell = piece.cell;
          var toCell = this.board.getCell(xy[0], xy[1]);
          if (fromCell != toCell) {
            piece.move(fromCell, toCell, true, 'fromState');
this.dw.dw('put piece on board without capturing : ' + piece.toDebugString());
if(fromCell) this.dw.dw(' moved from ' + fromCell.toDebugString());
if(toCell) this.dw.dw(' to ' + toCell.toDebugString());
            this.nextTurn();
          }
  },
  sendPieceToStand: function(piece){
this.dw.dw('entered sendPieceToStand: ' + piece.toDebugString());
/*
for (key in piece)
if(typeof piece[key] != 'function') this.dw.dw('key:' + key + ', piece[' + key + ']:' + piece[key]);
*/
if(piece.cell && piece.cell.piece){
  if(piece.name == piece.cell.piece.name){
    // いまpieceがいるcellのpieceプロパティが、自分をさしているなら、それは消しておく
this.dw.dw('piece.cell: ' + piece.cell.toDebugString() + 'is going to be nulled.');
    piece.cell.piece = null;
  } else {
    // fromStateの処理からここにきたとき、このcellにはすでに他の駒がきている場合があるのでそのときはなにもしない
  }
} else {
this.dw.dw('this piece has no cell.');
}
    var prefix = 'my';
    if (this.top == 1) {
      if (piece.player.id == 'player1'){
        prefix = 'opponent';
        piece.elm.addClassName('top');
        piece.elm.removeClassName('bottom');
      }
    } else {
      if (piece.player.id == 'player2'){
        prefix = 'opponent';
        piece.elm.addClassName('top');
        piece.elm.removeClassName('bottom');
      }
    }
    // まだこの時点ではpiece.cellにはinitialArrangeの情報が残ってしまっているので消す
    piece.cell = null;
    $(prefix + '-captured').appendChild(piece.elm);
this.dw.dw('piece:' + piece.name + ' was added to ' + prefix + '-captured in Game#sendPieceToStand');

    if (prefix == 'my' && this.isPlayer()) {
window.game.dw.dw('adding Draggable in sendPieceToStand:');
      new Draggable(piece.elm, {
          onStart: function() {
window.game.dw.dw('drag started 01 game sendPieceToStand');
            // alert('drag started 01 game sendPieceToStand');
          },
        onEnd: function() {
window.game.dw.dw('drag ended 01 game sendPieceToStand');
          this.elm.style.top = 0;
          this.elm.style.left = 0;
        }.bind(piece)
      });
    }
  },
  fromState: function(state) {
    this.dw.dw('<span>entered fromState</span>');
    this.processPlayer(state);
    if(!this.top_by_viewer) this.determineTop();
    var names = [
      'lion_player1', 'giraffe_player1', 'elephant_player1', 'chick_player1',
      'lion_player2', 'giraffe_player2', 'elephant_player2', 'chick_player2'
    ];
this.dw.dw('<div style="color:#00FF00">fromState: entering the loop of all pieces:</div>');
this.dw.dw('the length of names is ' + names.length);
this.dw.dw('the array names is ' + names.join(':'));
    for (var i = 0; i < names.length; i++) {
this.dw.dw('<div style="color:#0000FF">***** name from array is: ' + names[i] + ' *******</div>');
      var name = names[i];
      var piece = Piece.selectByName(name);
      var pieceData = state.get(name); // owner,x,y
      if (piece){
this.dw.dw('selected piece: ' + piece.toDebugString());
       if(pieceData) { // stateに情報がある駒

        pieceData = pieceData.split(',');
        var owner = this[pieceData[0]];
        var x = pieceData[1];
        var y = pieceData[2];
this.dw.dw('this piece is on state:' + name + ', data:' + pieceData + ', owner:' + owner + 'data on state is  x:[' + x + '] y:[' + y + ']');

        piece.setPlayer(owner);
        if (x && (x != '')) { // 盤上の駒
          this.putPieceOnBoard(piece, x, y);
        } else {  // captured
this.dw.dw('captured piece : ' + piece.toDebugString());
          this.sendPieceToStand(piece);
        }
      } else {
this.dw.dw('this piece is not on state:');
       // stateに情報がない駒 = 初期盤面から動いていない駒はinitialArrangeが済んでいる
      }
    }
    } // end of for
this.dw.dw('fromState: went out of the loop of all pieces: ');
    if (state.get('turn')) this.turn = this[state.get('turn')];
    if (!this.turn) this.turn = this.player1;
    this.controlPanel.update();
this.dw.dw('leaving fromState : ');
  },
  debug_dump: function(){
    var obj = {};
    obj['player1']	 = this.player1.toDebugString();
    obj['player2']	 = (this.player2 ? this.player2.toDebugString() : null);
    obj['top']		 = this.top;
    obj['turn']		 = this.turn;
    obj['board']	 = this.board.toDebugString();
    obj['Cell']		 = Cell.all.invoke('toDebugString').join('<br>');
    obj['Piece']	 = Piece.all.invoke('toDebugString').join('<br>');
    this.dw.dump_list(obj);
  }
});

