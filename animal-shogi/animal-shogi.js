HOST = 'http://skkmania.sakura.ne.jp/animal-shogi/';
//HOST = '';

ControlPanel = Class.create({
  initialize: function(game) {
    this.game = game;
  },
  reverse: function() {              
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
       $$('#bottom-captured img').invoke('removeClassName', 'opponent');
    }
  }, 
  update: function() {              
    if (!this.elm) {                          
      this.elm = $('control-panel');                         
      if (this.game.top == 1){                                                
        this.player1Elm = $('top-panel');
        this.player2Elm = $('bottom-panel');
      } else {       
        this.player2Elm = $('top-panel');
        this.player1Elm = $('bottom-panel');
      }                    
    }                           
    this.player1Elm.innerHTML = t('sente') + (this.game.player1 ? this.game.player1.statusHtml() : t('waiting'));
    this.player2Elm.innerHTML = t('gote') +  (this.game.player2 ? this.game.player2.statusHtml() : t('waiting'));
  } 
});

Piece = Class.create();
Piece.all = $A();
Piece.selectByName = function(name) {
  for (var i = 0; i < Piece.all.length; i++) {
    var piece = Piece.all[i];
    if (piece.name == name) return piece;
  }
  return null;
};
Piece.prototype = {
  initialize: function(player) {
    Piece.all.push(this);
    this.name = this.type + '_' + player.id;
    this.cell = null;
    this.elm = document.createElement('img');
    this.elm.obj = this;
    this.elm.src = this.imageUrl;
    this.elm.id = this.name;
    this.elm.addClassName('piece');
    this.setPlayer(player);
    if (this.isMine()) {
      new Draggable(this.elm, {
        onEnd: function() {
          this.elm.style.top = 0;
          this.elm.style.left = 0;
        }.bind(this)
      });
    }
  },
  initialArrange: function(board, atTop) {
    var pos = this.initialPosition;
window.game.dw.dw('piece initialArrange : ' + this.name + ',  atTop : ' + atTop + ',  pos : ' + pos.toString());
//alert('piece initialArrange : ' + this.name + ',  atTop : ' + atTop + ',  pos : ' + pos.toString());
    if (atTop) pos = [2 - pos[0], 3 - pos[1]];
window.game.dw.dw('piece initialArrange after corrected : ' + this.name + ',  atTop : ' + atTop + ',  pos : ' + pos.toString());
    //if (!this.isMine()) pos = [2 - pos[0], 3 - pos[1]];
//alert('piece : ' + this.name + ',  atTop : ' + atTop + ',  pos : ' + pos.toString());
    board.cells[pos[1]][pos[0]].put(this);
  },
  setPlayer: function(player) {
    this.player = player;
    if (this.player.mine) {
      this.elm.addClassName('mine');
      this.elm.removeClassName('opponent');
    }
    else {
      this.elm.removeClassName('mine');
      this.elm.addClassName('opponent');
    }
  },
  capturedBy: function(player) {
    this.setPlayer(player);
    this.cell = null;
    if (this.becomeNormal) this.becomeNormal();

    if (this.isMine()) {
      if (window.game.isPlayer()) {
        new Draggable(this.elm, {
          onEnd: function() {
            this.elm.style.top = 0;
            this.elm.style.left = 0;
          }.bind(this)
        });
      }
      $('my-captured').appendChild(this.elm);
    }
    else {
      $('opponent-captured').appendChild(this.elm);
    }
  },
  canMove: function(fromCell, toCell) {
    if (!fromCell) return true; // 打ち駒はどこでもOK
    var dx = fromCell.x - toCell.x;
    var dy = fromCell.y - toCell.y;
    if (1 < Math.abs(dx) || 1 < Math.abs(dy)) return false
    if (!this.mine) dy *= -1;
    return this.movableArea[dy + 1][dx + 1];
  },
  move: function(fromCell, toCell, notCapture) {
    var capturedPiece = null;
    if (!notCapture) {
      if (toCell.piece) {
        if (this.player == toCell.piece.player) throw t('cannot_get_own_piece');
        capturedPiece = toCell.piece;
        toCell.capturedBy(this.player);
      }
    }

    this.elm.parentNode.removeChild(this.elm);
    toCell.elm.appendChild(this.elm);
    if (fromCell) {
      fromCell.piece = null;
    }
    toCell.put(this);
    if (fromCell && this.type == 'chick' && toCell.isOpponentFirstLine(this.player)) {
      this.becomeSpecial();
    }
    return capturedPiece;
  },
  isMine: function() {
    return this.player.mine;
  },
  isGoal: function(cell) {
    if (this.isMine()) {
      return cell.y == 0;
    }
    else {
      return cell.y == 3;
    }
  },
  toString: function() {
    var ret = this.player.id + ',';
    var parentElm = this.elm.parentNode;

    if (this.cell) {
      var xy = window.game.upsideDownIfNeeded(this.cell.x, this.cell.y);
      ret += xy[0] + ',' + xy[1];
    }
//alert('Piece:toString -> ' + ret);
    return ret;
  },
  toDebugString: function() {
    var ret = this.player.id + ',';
    if (this.cell) {
      ret += this.cell.x + ',' + this.cell.y;
    }
    return ret;
  },
};

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
  createElm: function() {
    var marginTop = 0;
    var marginLeft = 0;
    var width = 90;

    this.elm = document.createElement('div');
    this.elm.id = 'cell-' + this.x + '-' + this.y;
    this.elm.obj = this;
    this.elm.addClassName('cell');
    this.elm.style.left = (marginLeft + width * this.x) + 'px';
    this.elm.style.top = (marginTop + width * this.y) + 'px';
    this.board.elm.appendChild(this.elm);
    Droppables.add(this.elm, {
      accept: 'piece',
      onDrop: function(draggable) {
        var fromCell = draggable.parentNode.obj;
        var toCell = this;
window.game.dw.dw('onDrop called. from ' + fromCell.toDebugString() + ' to ' + toCell.toDebugString());
        var piece = draggable.obj;

        if (!window.game.isViewersTurn()) {
          window.game.message(t('not_your_turn')); return;
        }
        if (!fromCell && toCell.piece) {
          window.game.message(t('already_occupied')); return;
        }
        if (!piece.canMove(fromCell, toCell)) {
          window.game.message(t('not_allowed')); return;
        }
        if (toCell.piece && piece.player == toCell.piece.player) {
          window.game.message(t('cannot_capture_yourown_piece')); return;
        }

        var capturedPiece = piece.move(fromCell, toCell);

        if (
          // 相手のライオンを捕獲
          (capturedPiece && capturedPiece.type == 'lion') || 
          // 自分のライオンが最奥に到達
          (piece.type == 'lion' && piece.isGoal(toCell) && window.game.isSafety(piece))
        ) {
          window.game.finish(piece.player);
        }
        else {
window.game.dw.dw('ordinary turn change?');
          window.game.nextTurn();
        }

        // 送信
        var delta = {};
        delta['turn'] = window.game.getTurn().id;
        delta[piece.name] = piece.toString();
        if (capturedPiece) delta[capturedPiece.name] = capturedPiece.toString();
        wave.getState().submitDelta(delta);
      }.bind(this)
    });
  },
  show: function() {
    if (!this.elm) {
      this.createElm();
    }
    if (this.piece) {
window.game.dw.dw(this.piece.toDebugString());
      this.elm.appendChild(this.piece.elm);
      if(this.piece.player.id == 'player1'){
        if(this.top == 0){
          this.piece.elm.addClassName('bottom');
          this.piece.elm.removeClassName('top');
          this.piece.elm.removeClassName('opponent');
        } else {
          this.piece.elm.addClassName('top');
          this.piece.elm.removeClassName('bottom');
          this.piece.elm.addClassName('opponent');
        }
      } else {
        if(this.top == 0){
          this.piece.elm.addClassName('top');
          this.piece.elm.removeClassName('bottom');
          this.piece.elm.addClassName('opponent');
        } else {
          this.piece.elm.addClassName('bottom');
          this.piece.elm.removeClassName('top');
          this.piece.elm.removeClassName('opponent');
        }
      }
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
  capturedBy: function(player) {
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
  toDebugString: function(){
    var ret = '';
    ret += '[' + this.x + ',' + this.y + ']';
    return ret;
  }
};

Board = Class.create({
  initialize: function(elm, game) {
    this.top = game.top;
    this.width = 3;
    this.height = 4;
    this.boardData = [];
    this.blackStand = '';
    this.whiteStand = '';
    this.elm = elm || document.body;;
    this.cells = [];
    for (var r = 0; r < this.height; r++) {
      var row = [];
      for (var c = 0; c < this.width; c++) {
        row.push(new Cell(this, c, r, this.top));
      }
      this.cells.push(row);
    }
  },
  show: function() {
    this.each(function(cell) {
      cell.show();
    });
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
  reverse: function(top) {

    for (var r = 0; r < this.height; r++) {
      for (var c = 0; c < this.width; c++) {
        this.cells[r][c].move(this.height - r - 1,this.width - c - 1); 
      }
    }
    var tmpAry = this.cells.flatten().reverse();
    tmpAry.each(function(c){
      if (c.piece) {
/*
//alert('piece name : ' + c.piece.name);
if(c.piece.elm.hasClassName('opponent')){
  //alert('opponent found -> ' + c.piece.player);
}
if(c.piece.elm.hasClassName('mine')){
  //alert('mine found -> ' + c.piece.player);
}
if(c.piece.elm.hasClassName('top')){
  //alert('top found -> ' + c.piece.player);
}
if(c.piece.elm.hasClassName('bottom')){
  //alert('bottom found -> ' + c.piece.player);
}
*/
        if (c.piece.player.id == 'player1') {
          if (top ==  0){
            c.piece.elm.removeClassName('opponent');
            c.piece.elm.addClassName('mine');
          } else {
            c.piece.elm.removeClassName('mine');
            c.piece.elm.addClassName('opponent');
          }
        } else {
          if (top ==  0){
            c.piece.elm.removeClassName('mine');
            c.piece.elm.addClassName('opponent');
          } else {
            c.piece.elm.removeClassName('opponent');
            c.piece.elm.addClassName('mine');
          }
        }
      }
    });

    this.cells = [];
    for (var r = 0; r < this.height; r++) {
      var row = [];
      for (var c = 0; c < this.width; c++) {
        row.push(tmpAry[c + r*this.width]);
      }
      this.cells.push(row);
    }
  }
});

Player = Class.create({
  initialize: function(id, name, mine, top) {
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
    if (id == 'player1'){  this.atTop = (top == 1); 
//alert('id : ' + this.id + ',  atTop : ' + this.atTop);
    }
    if (id == 'player2'){  this.atTop = (top != 1); 
//alert('id : ' + this.id + ',  atTop : ' + this.atTop);
    }
  },
  initialArrange: function(board) {
    var atTop = this.atTop;
    this.pieces.each(function(piece) {
      piece.initialArrange(board, atTop);
    });
  },
  shortName: function() {
    return this.name.split('@').first();
  },
  statusHtml: function() {
    var classNames = this.isViewer ? 'mine' : '';
    if (window.game.getTurn() == this) classNames += ' turn';
    return '<span class="' + classNames + '">' + this.shortName() + '</span>';
  },
  toString: function() {
    return this.name;
  },
  toDebugString: function() {
    return 'Player: name: ' + this.name + ', isViewer: ' +  this.isViewer + ', atTop: ' + this.atTop + ', ' + this.pieces.invoke('toDebugString').join(':'); 
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

AnimalShogiGame = Class.create({
  initialize: function(settings) {
////alert('initialize game object settings : ' + settings.containerId);
    this.dw = new DebugWindow(this, 'debug 1');
    this.dw.dw('start info');
    this.settings = settings;
    this.container = $(settings.containerId);
    this.determineTop();
    this.controlPanel = new ControlPanel(this);
    this.board = new Board(this.container, this);
    this.mode = 'init';
    this.message(t('click_join_button'));
    this.turn = null;
  },
  determineTop: function() {
     // 先手(player1)がbottomのとき0, top = 1 なら先手がtop
    if(this.player1 && this.player1.name == wave.getViewer().getId()){
      this.top = 0; 
    } else if (this.player2 && this.player2.name == wave.getViewer().getId()){
      this.top = 1;
    } else
      this.top = 0; // default
  },
  setPlayer: function(name, opponent) {
    if (!this.player1) {
      this.player1 = new Player('player1', name, !opponent, this.top);
      if (!opponent) this.myPlayer = this.player1;
      this.turn = this.player1
      this.controlPanel.update();
      this.message(t('waiting'));
      wave.getState().submitDelta({
        player1:name
      });
    }
    else if (!this.player2) {
      this.player2 = new Player('player2', name, !opponent, this.top);
      if (!opponent) this.myPlayer = this.player2;
      this.controlPanel.update();
      this.start();
      wave.getState().submitDelta({
        player2:name
      });
    }
    else {
      // TODO
      //throw 'Invalid Player Data';
    }
    this.determineTop();
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
    //this.board.show();
  },
  reverse: function() {
    this.message('game.top became ' + this.top);
    this.top = (this.top == 0 ? 1 : 0);
    this.board.reverse(this.top);
    this.controlPanel.reverse();
  },
  start: function() {
    this.player1.initialArrange(this.board);
//alert('start 1 : ' + this.player1.toDebugString());
    this.player2.initialArrange(this.board);
//alert('start 2 : ' + this.player2.toDebugString());
    this.determineTop();
    this.controlPanel.update();
    this.board.show();
  },
  nextTurn: function() {
    if (this.turn == this.player1) {
      this.turn = this.player2;
    }
    else if (this.turn == this.player2) {
      this.turn = this.player1;
    }
    window.game.controlPanel.update();
    window.game.clearMessage();
window.game.dw.dw('leaving nextTurn');
  },
  getTurn: function() {
    if (!this.turn) this.turn = this.player1;
    return this.turn;
  },
  isViewersTurn: function() {
    return this.turn.name == wave.getViewer().getId();
  },
  needUpsideDown: function() {
window.game.dw.dw('myPlayer: ' + this.myPlayer + ', name: ' + this.myPlayer.name);
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
window.game.dw.dw('entered upsideDownIfNeeded : x, y -> ' + x + ', ' + y);
    x = parseInt(x);
    y = parseInt(y);
    if (this.needUpsideDown()) {
window.game.dw.dw('leaving upsideDownIfNeeded : x, y -> ' + (2-x) + ', ' + (3-y));
      return [2 - x, 3 - y];
    }
    else {
//alert('leaving upsideDownIfNeeded : x, y -> ' + x + ', ' + y);
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
window.game.dw.dw('stateChanged: ' + state.toString());
    this.fromState(state);
  },
  toString: function() {
    var ret = '';
    var json = this.toJSON();
    for (var key in json) {
      ret += key + ' : ' + json[key] + '\n'
    };
    return ret;
  },
  toHTML: function() {
    var ret = '<table>';
    var json = this.toJSON();
    for (var key in json) {
      ret += '<tr><td>' + key + '</td><td>' + json[key] + '</td></tr>\n'
    };
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
  fromState: function(state) {
    var viewer = wave.getViewer().getId();
window.game.dw.dw('entered fromState: viewer: ' + viewer);
    if (!this.player1 && state.get('player1')) {
      var isMe = state.get('player1') == viewer;
      this.player1 = new Player('player1', state.get('player1'), isMe, this.top);
      this.controlPanel.update();
    }
    if (!this.player2 && state.get('player2')) {
      var isMeMaybe = state.get('player1') != viewer;
      this.player2 = new Player('player2', state.get('player2'), isMeMaybe, this.top);
      this.controlPanel.update();
      this.start();
    }

    if (this.player1 && this.player1.name == viewer) {
      this.myPlayer = this.player1;
    }
    else if (this.player2 && this.player2.name == viewer) {
      this.myPlayer = this.player2;
    }
window.game.dw.dw('myPlayer is defined : ' + this.myPlayer);
    if (this.player1 && this.player2) {
      $('join-button').hide();
    }

    var names = [
      'lion_player1', 'giraffe_player1', 'elephant_player1', 'chick_player1',
      'lion_player2', 'giraffe_player2', 'elephant_player2', 'chick_player2'
    ];
    for (var i = 0; i < names.length; i++) {
window.game.dw.dw('entered the loop of all pieces: ');
      var name = names[i];
      var piece = Piece.selectByName(name);
      var pieceData = state.get(name); // owner,x,y
      if (piece){
       if(pieceData) { // stateに情報がある駒

        pieceData = pieceData.split(',');
window.game.dw.dw('piece:' + name + ' data:' + pieceData);
        var owner = this[pieceData[0]];
        var x = pieceData[1];
        var y = pieceData[2];
window.game.dw.dw('piece on state:' + name + ', data:' + pieceData + ', owner:' + owner + ' x:[' + x + '] y:[' + y + ']');

        piece.setPlayer(owner);
        if (x && x != '') { // 盤上の駒
          var xy = this.upsideDownIfNeeded(x, y);
          // var xy = [x, y];
          var fromCell = piece.cell;
          var toCell = this.board.getCell(xy[0], xy[1]);
          if (fromCell != toCell) {
            piece.move(fromCell, toCell, true);
window.game.dw.dw('piece: ' + piece.toDebugString() + ' moved from ' + fromCell.toDebugString() + ' to ' + toCell.toDebugString() + 'under true. 1');
            window.game.nextTurn();
          }
        }
        else {
          // captured
          var prefix = 'my';
          if (this.needUpsideDown()) {
            if (piece.player.id == 'player1') prefix = 'opponent';
          }
          else {
            if (piece.player.id == 'player2') prefix = 'opponent';
          }
          $(prefix + '-captured').appendChild(piece.elm);

          if (prefix == 'my' && this.isPlayer()) {
            new Draggable(piece.elm, {
              onEnd: function() {
                this.elm.style.top = 0;
                this.elm.style.left = 0;
              }.bind(piece)
            });
          }
        }
      } else { // stateに情報がない駒 = 初期盤面から動いていない駒
               // bottom playerなら初期配置のままで、top playerなら座標変換が必要
window.game.dw.dw('not moving piece: ' + piece.toDebugString());
          var tx = piece.initialPosition[0];
          var ty = piece.initialPosition[1];
          if (this.needUpsideDown()) {
            if (piece.player.id == 'player1'){
window.game.dw.dw('piece.player.id : ' + piece.player.id);
              var xy = this.upsideDownIfNeeded(tx, ty);
              var fromCell = piece.cell;
              var toCell = this.board.getCell(xy[0], xy[1]);
              if (fromCell != toCell) {
                piece.move(fromCell, toCell, true);
window.game.dw.dw('piece: ' + piece.toDebugString() + ' moved from ' + fromCell.toDebugString() + ' to ' + toCell.toDebugString() + 'under true. 2');
                window.game.nextTurn();
              }
            }
          } else {
            if (piece.player.id == 'player2'){
              var xy = this.upsideDownIfNeeded(tx, ty);
              var fromCell = piece.cell;
              var toCell = this.board.getCell(xy[0], xy[1]);
              if (fromCell != toCell) {
                piece.move(fromCell, toCell, true);
window.game.dw.dw('piece: ' + piece.toDebugString() + ' moved from ' + fromCell.toDebugString() + ' to ' + toCell.toDebugString() + 'under true. 3');
                window.game.nextTurn();
              }
            }
          }
       }
     } else { // 存在しないpiece ? こんなケースがあるかどうか不明
     }

    }
    if (state.get('turn')) this.turn = this[state.get('turn')];
    if (!this.turn) this.turn = this.player1;
    this.controlPanel.update();
  },
  debug_dump: function(){
    var ret = '';
    this.board.cells.each(function(r){
      r.each(function(c){
        ret += c.toDebugString(); 
        ret += (c.piece ? c.piece.toDebugString() : 'no p');
      });
      ret += '\n';
    });
    alert(ret);
  }
});

