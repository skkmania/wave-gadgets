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
        window.gameController.game.blackStand
      : window.gameController.game.whiteStand;
  },
	/**
	 * atTop()
	 */
  atTop: function atTop(game){ // Player
    return (this.id == 'player1') == (window.gameController.game.top == 1);
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
    if (window.gameController.game.getTurn() == this) classNames += ' turn';
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
    this.game.log.goOut();
  }, 
	/**
	 * waitPlayer()
	 */
  waitPlayer: function waitPlayer() { // ControlPanel             
    this.game.log.getInto();
    this.game.log.goOut();
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
  initialize: function initialize(settings, log) {
    var title = settings['logTitle'] || 'popup';
    this.log = log;
    this.log.getInto('GameController#initialize');
    this.settings = settings;
    if(settings === undefined){
      this.log.debug('settings is undefined.');
    } else {
      this.log.debug(this.settings);
    }

    this.game = new AnimalShogiGame(settings, this);
    // this.game.open();
    this.players = $A([]);
    this.blackplayers = $A([]);
    this.whiteplayers = $A([]);
    this.playingViewer = null;
    this.getViewer();
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
	 * playerSetup()
	 */
  playerSetup: function playerSetup() { // GameController
    this.log.getInto();
    this.log.goOut();
  },
	/**
	 * mainRoutine()
	 */
  mainRoutine: function mainRoutine() { // GameController
    this.log.getInto('GameController#mainRoutine');
    this.providePlayer();
    this.makeGameAct();
    this.turn++;
    this.log.debug('leaving mainRoutine');
    this.log.goOut();
  },
	/**
	 * sendDelta()
	 */
  sendDelta: function sendDelta(){ // GameController
    this.log.getInto('GameController#sendDelta');
    // 送信
    var delta = {};
/*
    delta['board'] = this.game.board.toString();
    delta['bstand'] = this.game.blackStand.toString();
    delta['wstand'] = this.game.whiteStand.toString();
    delta['count'] = this.game.count.toString();
*/
    this.log.warn('<div style="color:#FF0000">sending delta : </div>' + delta.toString());
    wave.getState().submitDelta(delta);
    this.log.goOut();
  },
	/**
	 * finishCheck()
	 */
  finishCheck: function finishCheck() { // GameController
    this.log.getInto('GameController#finishCheck');
    this.log.goOut();
  },
	/**
	 * providePlayer()
	 */
  providePlayer: function providePlayer() { // GameController
    this.log.getInto('GameController#providePlayer');
    this.game.getPlayer(this.playerInTurn());
    this.log.goOut();
  },
	/**
	 * playerInTurn()
	 */
        // 現在の手番のplayer objectを返す
  playerInTurn: function playerInTurn() { // Game
    this.log.getInto('GameController#playerInTurn');
    if (this.turn % 2 == 0)
      ret = this.blackplayers[0];
    else
      ret = this.whiteplayers[0];
    this.log.goOut();
    return ret;
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
    if(this.finishCheck()){
      this.sendDelta();
    }
    this.log.goOut();
    return null;
  },
	/**
	 * receiveAction()
	 */
  // ユーザのアクションがここに通知される
  //   (具体的には、gameのPieceがonDropの中でこの関数を呼び出す)
  // actionContents : [piece, fromObj, toCell]
  receiveAction: function receiveAction(actionContents) { // GameController
    this.log.getInto('GameController#receiveAction');
    if(this.game.respondValidity(actionContents)){
      this.confirmActionByUser(actionContents);
    } else {
      this.noticeBadActionToUser();
    }
    this.log.goOut();
  },
	/**
	 * confirmActionByUser(actionContents)
	 */
        // action内容をユーザに提示し、ユーザからそれでよいかどうか確認をとる
        // 成り・不成りを確認することを想定
  confirmActionByUser: function confirmActionByUser(actionContents) { // GameController
    this.log.getInto('GameController#confirmActionByUser');
    this.game.confirmActionByUser(actionContents);
    this.log.goOut();
  },
	/**
	 * getResponseToConfirmActionByUser()
	 */
        // ユーザに対し表示した確認用要素のクリックイベントはこの関数を呼び出す
  //getResponseToConfirmActionByUser: function getResponseToConfirmActionByUser(event,actionContents) {
  getResponseToConfirmActionByUser: function getResponseToConfirmActionByUser(event) {
    var log = window.gameController.log;
    log.getInto('GameController#getResponseToConfirmActionByUser');
      // この関数にはactionContentsがbindされているので、thisはこの中ではactionContentsを指す
    var actionContents = this;
    log.debug('actionContents[0] : ' + actionContents[0].toDebugString());

    log.debug('event.element : ' + event.element().id);

    switch (event.element().id) {
      case 'yesElement':
        log.debug('yesElement was clicked.');
        window.gameController.game.promotePiece(actionContents).call(actionContents[0]);
/*
  ここは、以下の意味。
        var f = window.gameController.game.promotePiece(actionContents);
        log.debug('got function? -- type is  ' + typeof f);
        f.call(actionContents[0]);
        log.debug('function called.');
*/
        window.gameController.game.doAction(actionContents);
      break;
      case 'noElement':
        log.debug('noElement was clicked.');
      break;
    }
    $('promoteOrNot').stopObserving();
    log.goOut();
  },
	/**
	 * noticeBadActionToUser()
	 */
        // action内容がゲームから不正といわれたときに、ユーザにそれを知らせる
  noticeBadActionToUser: function noticeBadActionToUser(actionContents) { // GameController
    this.log.getInto('GameController#noticeBadActionToUser');
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
	 * joinButtonPressed(name)
	 */
        // 機能：　joinボタン押下に対し反応し再びjoinボタン押下待ち状態に戻る
        // this.playersの人数が２人になったら次の段階へ進む
  joinButtonPressed: function joinButtonPressed(name) { // GameController
    this.log.getInto('GameController#joinButtonPressed');
    var deltakey = null; 
    switch (this.players.length){
      case  0:
        this.log.debug('first player added');
        this.players.push(name);
        this.message(t('waiting'));
        deltakey = 'player_candidate_1';
        break;
      case 1:
        this.log.debug('second player added');
        this.players.push(name);
        this.setPlayersOrder();
        this.hideJoinButton();
        deltakey = 'player_candidate_2';
        break;
    }
    this.controlPanel.update();
    this.log.goOut();
    // 以下を呼べば、stateChangedに飛んでしまう
    wave.getState().submitDelta({
      deltakey:name
    });
  },
	/**
	 * setPlayersOrder()
	 */
        // 前提： 2人のプレイヤーがいる（this.players.length == 2)
        // 機能： 2つのPlayerオブジェクトを生成し、ランダムに2人のプレイヤーに割り当てる
  setPlayersOrder: function setPlayersOrder() { // GameController
    this.log.getInto('GameController#setPlayersOrder');
    if(Math.random() < 0.5){ 
      this.player1 = new Player('player1', this.players[0]);
      this.player2 = new Player('player2', this.players[1]);
    } else {
      this.player1 = new Player('player1', this.players[1]);
      this.player2 = new Player('player2', this.players[0]);
    }
    this.blackplayers.push(this.player1);
    this.whiteplayers.push(this.player2);
    this.log.goOut();
  },
/*
    if (!this.player1) {
      this.log.getInto('setting player1');
      this.player1 = new Player('player1', name, !opponent);
      if (!opponent) this.playingViewer = this.player1;
      this.controlPanel.update();
      this.message(t('waiting'));
      wave.getState().submitDelta({
        player1:name
      });
      this.log.goOut();
    }
    else if (!this.player2) {
      if (name != this.player1.name){
        this.log.getInto('setting player2');
        this.player2 = new Player('player2', name, !opponent);
        if (!opponent) this.playingViewer = this.player2;
        this.determineTop();
        this.controlPanel.update();
        this.message('');
        this.start();
        wave.getState().submitDelta({
          player2:name
        });
        this.log.goOut();
      } else
        this.message(t('cannot_play_with_same_person'));
    }
      // TODO
      //throw 'Invalid Player Data';
    this.log.goOut();
  },
*/
	/**
	 * message(message)
	 */
  message: function message(message) { // GameController
    this.log.getInto('GameController#message');
    if (!this.messageElm) {
      this.messageElm = $('message-body');
    }
    this.messageElm.innerHTML = message;
    this.log.debug(message);
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
  nextTurn: function nextTurn() { // GameController
    this.log.getInto('GameController#nextTurn');
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
    this.log.getInto();
    if (this.checkFinish(piece, toCell))
      this.message(winner.shortName() + t('win'));
    else
      this.sendDelta();
    this.log.goOut();
  },
	/**
	 * stateChanged()
	 */
  stateChanged: function stateChanged() {  // Game
    this.log.getInto('GameController#stateChanged');
    var state = wave.getState();
    this.log.debug('state in string is: ' + arrange(state));
    this.fromState(state);
    this.log.goOut();
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
	 * getViewer()
	 */
  getViewer: function getViewer(){ // GameController
    this.log.getInto('GameController#getViewer');
    this.viewer = wave.getViewer().getId();
    this.log.debug('viewer: ' + this.viewer);
    this.log.goOut();
  },
	/**
	 * processPlayer(state)
	 */
  processPlayer: function processPlayer(state){ // Game
    this.log.getInto('GameController#processPlayer');
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
      var pl1IsViewer = (pl1 == this.viewer);
      this.player1 = new Player('player1', pl1, pl1IsViewer );
      this.controlPanel.update();
this.log.info('leaving processing Player1: ');
this.log.goOut();
    }
    if (!this.player2 && pl2) {  // 各normalスナップに1回通る
this.log.getInto();
this.log.warn('processPlayer: processing Player2: ');
      var pl2IsViewer = (pl2 == this.viewer);
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
  fromState: function fromState(state) { // GameController
    this.log.getInto('GameController#fromState');
    this.getPlayersFromState(state);
    if(!this.game.askPlayersEnough(this.players)){
      this.controlPanel.waitPlayer();
    } else {
      this.mainRoutine();
    }
    this.log.warn('leaving Game#fromState');
    this.log.goOut();
  },
	/**
	 * getPlayersFromState(state)
	 */
  getPlayersFromState: function getPlayersFromState(state) { // game
    this.log.getInto();
    var p1, p2;
    if (p1 = state.get('player_candidate_1')){
      this.log.debug('player_candidate_1 : ' + p1);
      if (!this.players.include(p1))
        this.players.push(p1);
    }
    if (p2 = state.get('player_candidate_2')){
      this.log.debug('player_candidate_2 : ' + p2);
      if (!this.players.include(p2))
        this.players.push(p2);
    }
    if (p1 && p2) {
      this.setPlayersOrder();
    }
    this.log.debug('players : ' + this.players.join(', '))
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
   delta['board'] = window.gameController.game.board.toString();
   delta['bstand'] = window.gameController.game.blackStand.toString();
   delta['wstand'] = window.gameController.game.whiteStand.toString();
   delta['count'] = window.gameController.game.count.toString();
window.gameController.game.log.warn('<div style="color:#FF0000">sending delta : </div>' + delta.toString());
   wave.getState().submitDelta(delta);
}

	/**
	 * checkFinish(piece, toCell)
	 */
function checkFinish(piece, toCell){
window.gameController.game.log.getInto();
window.gameController.game.log.warn('entered checkFinish');
   var ret = (
   // 相手のライオンを捕獲
   (toCell.piece.type == 'lion') || 
   // 自分のライオンが最奥に到達
   (piece.type == 'lion' && piece.isGoal(toCell))
           //  && window.gameController.game.isSafety(piece))
  );
window.gameController.game.log.warn('checkFinish leaving with : ' + ret);
window.gameController.game.log.goOut();
  return ret;
}
