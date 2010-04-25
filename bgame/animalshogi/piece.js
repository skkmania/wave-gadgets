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
    this.drag = null;
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
	 * addDraggable(startMessage)
	 */
  addDraggable: function addDraggable(startMessage){ // Piece
    this.game.log.getInto('Piece#addDraggable');
    this.game.log.debug('piece:' + this.toDebugString());
    this.game.log.debug('msg:' + startMessage);
  
    this.drag = new Draggable(this.elm, {
          onStart: function onStart() {
            this.game.log.getInto('Draggable#onStart of ' + this.toDebugString());
            this.game.log.warn('Drag started. : ' + startMessage, {3:{'color':'#33AA88'}});
            this.game.log.goOut();
          }.bind(this),
          onEnd: function onEnd() {
            this.game.log.getInto('Draggable#onEnd of ' + this.toDebugString());
            this.elm.style.top = 0;
            this.elm.style.left = 0;
            this.game.log.goOut();
          }.bind(this)
        });
  
    this.game.log.debug('drags #: ' + Draggables.drags.length);
    this.game.log.debug('added obj is : ' + this.drag.toString());
    this.game.log.goOut();
  },
	/**
	 * toggleDraggable()
	 */
  toggleDraggable: function toggleDraggable(){ // Piece
    this.game.log.getInto('Piece#toggleDraggable');
    this.game.log.debug('entered Piece#toggleDraggable:'+this.toDebugString());
    if(this.drag){
      this.game.log.debug('this.drag : '+ this.drag.toString());
    } else {
      this.game.log.debug('this piece has no drag');
    }
    this.game.log.debug('count : '+this.game.controller.count);
    var thisPieceIsViewers = this.isViewersP();
    this.game.log.debug('isViewersP : '+ thisPieceIsViewers);
    var thisTurnIsViewers = this.game.controller.isViewersTurn();
    this.game.log.debug('isViewersTurn : '+thisTurnIsViewers);
    if (!this.drag){
        if(thisPieceIsViewers && thisTurnIsViewers){
          this.addDraggable('toggled');
        }
    } else {
      if(thisPieceIsViewers){
        if(!thisTurnIsViewers){
          this.game.log.debug('to destroy drag because this is not Vieweres turn. : '+ Draggables.drags.length);
          this.drag.destroy();
          this.game.log.debug('length of drags became : '+ Draggables.drags.length);
          this.drag = null;
        }
      } else {
        this.game.log.debug('to destroy drag because this is not Vieweres piece. : '+ Draggables.drags.length);
        this.drag.destroy();
        this.game.log.debug('length of drags became : '+ Draggables.drags.length);
        this.drag = null;
      }
    }
    this.game.log.debug(this.drag?'drag remains':'no drag');
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
    var ret;
    if (this.isBlack()){
      this.game.log.debug('owner name : ' + this.game.controller.player1.name);
      ret = this.game.controller.player1.isViewer;
    } else {
      this.game.log.debug('owner name : ' + this.game.controller.player2.name);
      ret = this.game.controller.player2.isViewer;
    }
    this.game.log.debug('returning with : ' + ret);
    this.game.log.goOut();
    return ret;
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
  imageUrl: HOST + 'img/animalshogi/lion.png',
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
  imageUrl: HOST + 'img/animalshogi/elephant.png',
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
  imageUrl: HOST + 'img/animalshogi/giraffe.png',
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
  imageUrl: HOST + 'img/animalshogi/chick.png',
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
  imageUrl : HOST + 'img/animalshogi/chicken.png',
  type : 'chicken',
  movableArea : [
      [ true,  true,  true],
      [ true, false,  true],
      [false,  true, false]
    ],
  unpromote_type: 'chick'
  }
}

