HOST = 'http://skkmania.sakura.ne.jp/animal-shogi/';

/**
 * Player
 */
Player = Class.create({
	/**
	 * initialize(id, name, mine)
	 */
  initialize: function initialize(id, name, isViewer ) {
    this.id = id;
    this.name = name;
    this.isViewer = isViewer;
  },
	/**
	 * stand()
	 */
  stand: function stand(){
    return (this.id == 'player1') ?
        window.game.blackStand
      : window.game.whiteStand;
  },
	/**
	 * atTop()
	 */
  atTop: function atTop(game){ // Player
    return (this.id == 'player1') == (window.game.top == 1);
  },
	/**
	 * shortName()
	 */
  shortName: function shortName() {
    return this.name.split('@').first();
  },
	/**
	 * statusHtml()
	 */
  statusHtml: function statusHtml() {
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
  toString: function toString() { // Player
    return this.name;
  },
	/**
	 * toDebugString()
	 */
  toDebugString: function toDebugString() { // Player
    return 'Player: name: ' + this.name + ', isViewer: ' +  this.isViewer + ', atTop: ' + this.atTop(); 
  }
});



ControlPanel = Class.create({
	/**
	 * initialize(game)
	 */
  initialize: function initialize(game) {
    this.game = game;
    if(this.game) this.game.log.warn('CP initialized.');
  },
	/**
	 * reverse()
	 */
  reverse: function reverse() { // ControlPanel              
this.log.getInto();
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
this.log.goOut();
  }, 
	/**
	 * update()
	 */
  update: function update() { // ControlPanel             
    this.game.log.getInto();
    this.game.log.debug('cp update entered.'); 
    // this.game.determineTop();
    // this.game.log.debug('cp update : top is ' + this.game.top); 
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
    this.game.log.goOut();
  } 
});

/*
 *	 GameController
 */
GameController = Class.create({
	/**
	 * initialize(settings)
	 */
  initialize: function initialize(settings) {
    var title = settings['logTitle'] || 'popup';
    this.log = new Log(Log.DEBUG, 'popup', { 'title': title, 'host' : HOST, resizable: false, height:200, width:700 });
    $('control_window_2').insert(new Element('img',{id:'handle9',src:"./img/window_close.gif"}));
    new Resizable('control_window_2',{handle:'handle9'});
    this.log.getInto('Game#initialize');
    this.settings = settings;
    if(settings === undefined){
      this.log.debug('settings is undefined.');
    } else {
      this.log.debug(this.settings);
    }

    this.game = new AnimalShogiGame(settings, this.log);
    // this.game.open();
    this.playingViewer = null;
    this.container = $(this.settings['containerId']);
    this.controlPanel = new ControlPanel(this);
    this.log.warn('CP created.');
    this.mode = 'init';
    this.message(t('click_join_button'));
    this.count = 0;
       // 手数。このgameではcount手目を指した局面がthis.gameのboard,blackStand, whiteStandに反映されているものとする.
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
    this.log.warn('leaving GameController#initialize',{3:{'color':'green'}});
    this.log.goOut();
    // this.debug_dump();
  },
	/**
	 * mainRoutine()
	 */
  mainRoutine: function mainRoutine() { // Game
    this.log.getInto();
    this.providePlayer();
    // this.receiveAction(); これはthis.gameから呼び出される
    this.makeGameAct();
    // this.receiveResult(); これもthis.gameから呼び出される
    this.finishCheck();
    this.sendDelta();
    this.log.goOut();
  },
	/**
	 * sendDelta()
	 */
  sendDelta: function sendDelta(){
    this.log.getInto();
    // 送信
    var delta = {};
    delta['board'] = this.game.board.toString();
    delta['bstand'] = this.game.blackStand.toString();
    delta['wstand'] = this.game.whiteStand.toString();
    delta['count'] = this.game.count.toString();
    this.log.warn('<div style="color:#FF0000">sending delta : </div>' + delta.toString());
    wave.getState().submitDelta(delta);
    this.log.goOut();
  },
	/**
	 * finishCheck()
	 */
  finishCheck: function finishCheck() { // Game
    this.log.getInto();
    this.log.goOut();
  },
	/**
	 * providePlayer()
	 */
  providePlayer: function providePlayer() { // Game
    this.log.getInto();
    this.game.getPlayer(this.playerInTurn());
    this.log.goOut();
  },
	/**
	 * playerInTurn()
	 */
  playerInTurn: function playerInTurn() { // Game
    this.log.getInto();
    this.log.goOut();
    return null;
  },
	/**
	 * makeGameAct()
	 */
  makeGameAct: function makeGameAct() { // Game
    this.log.getInto();
    this.log.goOut();
    return null;
  },
	/**
	 * receiveResult()
	 */
  receiveResult: function receiveResult() { // Game
    this.log.getInto();
    this.log.goOut();
    return null;
  },
	/**
	 * receiveAction()
	 */
  // ユーザのアクションがここに通知される
  //   (具体的には、onDropの中でこの関数を呼び出す)
  receiveAction: function receiveAction(actionContents) { // Game
    this.log.getInto();
    if(this.game.respondValidity(actionContents)){
      this.confirmAction();
    }
    this.log.goOut();
  },
	/**
	 * determineTop()
	 */
  determineTop: function determineTop() { // Game
this.log.getInto();
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
this.log.goOut();
  },
	/**
	 * setPlayer(name, opponent)
	 */
        // GameのsetPlayerが呼ばれるのはjoinボタンが押されたときだけ
  setPlayer: function setPlayer(name, opponent) { // Game
this.log.getInto();
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
this.log.goOut();
  },
	/**
	 * message(message)
	 */
  message: function message(message) {
this.log.getInto();
    if (!this.messageElm) {
      this.messageElm = $('message-body');
    }
    this.messageElm.innerHTML = message;
this.log.goOut();
  },
	/**
	 * clearMessage()
	 */
  clearMessage: function clearMessage() {
    this.message('');
this.log.goOut();
  },
	/**
	 * show()
	 */
  show: function show() { // game
this.log.warn('game.show');
    //this.board.show();
  },
	/**
	 * reverse()
	 */
  reverse: function reverse() { // game
this.log.getInto();
    var tmp = null;
    this.top = (this.top === 0 ? 1 : 0);
    this.top_by_viewer = this.top;
    this.message('game.top became ' + this.top);
    this.game.board.reverse();
    this.game.board.adjust();
    tmp = $('top-stand').childElements()[0];
    $('top-stand').appendChild($('bottom-stand').childElements()[0]);
    $('bottom-stand').appendChild(tmp);
    tmp = $$('#top-stand img', '#bottom-stand img');
    if(tmp.size() > 0){
      tmp.invoke('toggleClassName', 'top');
      tmp.invoke('toggleClassName', 'bottom');
    }
    this.controlPanel.reverse();
this.log.goOut();
  },
	/**
	 * start()
	 */
  start: function start() { // Game
this.log.getInto();
    this.log.warn('game.start was called.');
    this.determineTop();
    this.controlPanel.update();
    this.game.board.show();
    this.log.warn('leaving game.start.');
this.log.goOut();
  },
	/**
	 * nextTurn()
	 */
  nextTurn: function nextTurn() { // Game
this.log.getInto();
this.log.debug('entered Game#nextTurn', {'indent':1});
    this.count++;
    this.controlPanel.update();
    this.clearMessage();
    this.toggleDraggable();
this.log.debug('leaving Game#nextTurn', {'indent':-1});
this.log.goOut();
  },
	/**
	 * getTurn()
	 */
  getTurn: function getTurn() {
    // turnは論理値。countが偶数ならtrueで先手番、奇数ならfalseで後手番。
    return (this.count % 2 == 0);
  },
	/**
	 * thisTurnPlayer()
	 */
  thisTurnPlayer: function thisTurnPlayer() {
    return this.getTurn() ? this.player1 : this.player2;
  },
	/**
	 * isViewersTurn()
	 */
  isViewersTurn: function isViewersTurn() { // Game
    return this.thisTurnPlayer().isViewer;
  },
	/**
	 * finish(winner)
	 */
  finish: function finish(winner) {
    this.message(winner.shortName() + t('win'));
  },
	/**
	 * stateChanged()
	 */
  stateChanged: function stateChanged() {  // Game
    var state = wave.getState();
this.log.warn('stateChanged: ' + arrange(state));
    this.fromState(state);
this.log.warn('leaving stateChanged:');
  },
	/**
	 * toString()
	 */
  toString: function toString() { // Game
    var ret = '';
/*
    var json = this.toJSON();
    for (var key in json) {
      ret += key + ' : ' + json[key] + '\n';
    }
    return ret;
*/
    return 'dummy';
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
//this.debug_dump();
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
    this.determineTop();
if(this.playingViewer) this.log.debug('playingViewer is defined : ' + this.playingViewer);
    if (this.player1 && this.player2) {
      this.message('');
      $('join-button').hide();
    }
this.log.warn('leaving Game#processPlayer: viewer: ' + viewer);
this.log.goOut();
  },
	/**
	 * fromState(state)
	 */
  fromState: function fromState(state) { // game
this.log.getInto();
/*
    this.log.warn('<span style="color:#00FFFF">entered fromState</span>');
    this.processPlayer(state);
    this.count = state.get('count');
    this.board.read(state.get('board', this.board.initialString));
    this.blackStand.read(state.get('bstand', this.blackStand.initialString));
    this.whiteStand.read(state.get('wstand', this.whiteStand.initialString));
    this.toggleDraggable();
*/
    this.controlPanel.update();
this.log.warn('leaving Game#fromState');
this.log.goOut();
  },
	/**
	 * debug_dump()
	 */
  debug_dump: function debug_dump(){
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
    //obj['all pieces']    = this.allPieces().length;
    obj['player1']	 = (this.player1 ? this.player1.toDebugString():null);
    obj['player2']	 = (this.player2 ? this.player2.toDebugString():null);
    obj['playingViewer'] = (this.playingViewer ? this.playingViewer.toDebugString():null);
    obj['top']		 = this.top;
    //obj['board']	 = this.board.toDebugString();
    //obj['board']	 = this.board.toString();
    //obj['blackStand']	 = this.blackStand.toString();
    //obj['whiteStand']	 = this.whiteStand.toString();
    //obj['Cell']	 = Cell.all.invoke('toDebugString').join('<br>');
    //obj['PieceOnBoard']	 = '<br>' + this.board.cells.flatten().findAll(function(c){ return c.piece != null; }).invoke('toDebugString').join('<br>');
    //obj['PieceOnBlackStand']	 = '<br>' + this.blackStand.elm.childElements().pluck('obj').invoke('toDebugString').join('<br>');
    //obj['PieceOnWhiteStand']	 = '<br>' + this.whiteStand.elm.childElements().pluck('obj').invoke('toDebugString').join('<br>');
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
	 * checkFinish(piece, toCell)
	 */
function checkFinish(piece, toCell){
window.game.log.getInto();
window.game.log.warn('entered checkFinish');
   var ret = (
   // 相手のライオンを捕獲
   (toCell.piece.type == 'lion') || 
   // 自分のライオンが最奥に到達
   (piece.type == 'lion' && piece.isGoal(toCell))
           //  && window.game.isSafety(piece))
  );
window.game.log.warn('checkFinish leaving with : ' + ret);
window.game.log.goOut();
  return ret;
}
