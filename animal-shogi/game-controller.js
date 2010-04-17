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

/**
 * ControlPanel
 */
ControlPanel = Class.create({
	/**
	 * initialize(game)
	 */
  initialize: function initialize(controller) { // ControlPanel
    controller.log.getInto('ControlPanel#initialize');
    this.controller = controller;
    this.controller.log.goOut();
  },
	/**
	 * reverse()
	 */
  reverse: function reverse() { // ControlPanel              
     this.controller.log.getInto('ControlPanel#reverse');
     this.controller.log.debug('start reverse cp'); 
      if (this.controller.game.top == 1){                                                
        this.player1Elm = $('top-panel');
        this.player2Elm = $('bottom-panel');
      } else {       
        this.player2Elm = $('top-panel');
        this.player1Elm = $('bottom-panel');
      }                    
    this.player1Elm.update(t('sente') + (this.controller.player1 ? this.controller.player1.statusHtml() : t('waiting')));
    this.player2Elm.update(t('gote') +  (this.controller.player2 ? this.controller.player2.statusHtml() : t('waiting')));
    this.controller.log.debug('ControlPanel#reverse end'); 
    this.controller.log.goOut();
  }, 
	/**
	 * waitPlayer()
	 */
  waitPlayer: function waitPlayer() { // ControlPanel             
    this.controller.log.getInto();
    this.controller.log.goOut();
  }, 
	/**
	 * update()
	 */
  update: function update(mode) { // ControlPanel             
    this.controller.log.getInto('ControlPanel#update');
    this.controller.log.debug('mode : ' + mode);
    if (!this.elm) this.elm = $('control-panel');                         
    if (this.controller.game.top == 1){                                                
      this.player1Elm = $('top-panel');
      this.player2Elm = $('bottom-panel');
    } else {       
      this.player2Elm = $('top-panel');
      this.player1Elm = $('bottom-panel');
    }                    
    switch(mode){
      case 'onePlayer':
        if(this.controller.players[0])
          $('message-body').update(this.controller.players[0] + ' is waiting');
        break;
      case 'playing':
        this.controller.message('');
        if(this.controller.player1)
          this.player1Elm.innerHTML = t('sente') + this.controller.player1.statusHtml();
        else
          this.player1Elm.innerHTML = t('sente');
        this.controller.log.debug('player1 is written on panel');
        if(this.controller.player2)
          this.player2Elm.innerHTML = t('gote') + this.controller.player2.statusHtml();
        else
          this.player2Elm.innerHTML = t('gote');
        this.controller.log.debug('player2 is written on panel');
        break;
      default:
        this.player1Elm.innerHTML = t('sente');
        this.player2Elm.innerHTML = t('gote');
    }
    this.controller.log.warn('cp update leaving'); 
    this.controller.log.goOut();
  } 
});

/*
 *	 GameController
 */
GameController = Class.create({
	/**
	 * initialize(settings)
	 */
  initialize: function initialize(settings, log) { // GameController
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
    //this.getViewer();
    this.container = $(this.settings['containerId']);
    this.controlPanel = new ControlPanel(this);
    this.log.warn('CP created.');
    this.mode = '';
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
	 * acceptState()
	 */
        // state changeに対するコールバック
        // 機能：state.modeに対応し、各関数にふりわける
  acceptState: function acceptState() { // GameController
    this.log.getInto('GameController#acceptState');
    if(wave) {
      var state = wave.getState();
      this.log.debug('state in string is: ' + arrange(state));
      if (this.mode = state.get('mode')){
        this.log.debug('mode read from state is : ' + this.mode);
        switch(this.mode){
          case 'noPlayers':
            this.controlPanel.update('noPlayers');
            this.noPlayers();
            break;
          case 'onePlayer':
            this.controlPanel.update('onePlayer');
            this.onePlayer(state);
            break;
          case 'preparePlayers':
            this.controlPanel.update('preparePlayers');
            this.preparePlayers(state);
            break;
          case 'playing':
            this.controlPanel.update('playing');
            this.playing(state);
            break;
          default:
            this.log.debug('there is no mode in state');
            this.mode = 'noPlayers';
            this.log.debug('so, this.mode is set to "noPlayers"');
            this.noPlayers();
            break;
       }
     }
   } else {
      this.log.fatal('wave not found');
   }
   this.log.goOut();
  },
	/**
	 * noPlayers()
	 */
        // gadget起動時のstate changeに対するコールバック
        // 機能：最初の参加者を受付、次の参加を待つ
  noPlayers: function noPlayers() { // GameController
    this.log.getInto('GameController#noPlayers');
    this.controlPanel.update('noPlayers');
        // join buttonがclickされるのを待つ
    this.message(t('click_join_button'));
    this.log.goOut();
  },
        /*
	 * onePlayer(state)
	 */
        // gadget起動時のstate changeに対するコールバック
        // 参加者が一人だけいるstateに対応する
        // 機能：2人目の参加者を受付
  onePlayer: function onePlayer(state) { // GameController
    this.log.getInto('GameController#onePlayer');
    this.getPlayersFromState(state);
    this.controlPanel.update('onePlayer');
    this.log.goOut();
  },
        /*
	 * preparePlayers(state)
	 */
        // 参加者が2人以上いるstateに対応する
        // 機能：playersを対局用に配置する
  preparePlayers: function preparePlayers(state) { // GameController
    this.log.getInto('GameController#preparePlayers');
    this.getPlayersFromState(state);
    if(!this.game.askPlayersEnough(this.players)){
      this.log.fatal('game says not enouph player!');
      //this.controlPanel.waitPlayer();
    } else {
      //this.mainRoutine();
      this.playing(state);
    }
    this.controlPanel.update('preparePlayers');
    this.log.goOut();
  }, 
	/**
	 * playing(state)
	 */
        // プレイヤーが揃ってゲームが始まった後のstateChangeへのコールバック
        // これが呼ばれたときにはstateのmodeは'playing'であり
        // stateのplayersにはメンバーの名の文字列が
        // コンマ区切りで複数個並んでいる
  playing: function playing(state) {  // GameController
    this.log.getInto('GameController#playing');
    if(!this.player1) this.getPlayersFromState(state);
    //$('join-button').hide();
    if (!this.game.board.shown) this.game.board.show();
    this.fromState(state);
    this.log.goOut();
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
    if (this.getTurn())
      ret = this.blackplayers[0];
    else
      ret = this.whiteplayers[0];
    this.log.goOut();
    return ret;
  },
	/**
	 * makeGameAct()
	 */
  makeGameAct: function makeGameAct() { // GameController
    this.log.getInto();
    this.game.toggleDraggable();
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
    this.log.debug('arguments : ' + name);
    this.log.debug('this.players : ' + this.players.length + ' : ' + this.players.join(', '));
    var deltakey = null; 
    var delta = {};
    switch (this.mode){
      case  'noPlayers' || undefined:
        this.log.debug('first player added');
        this.players.push(name);
        this.message(t('waiting'));
        deltakey = 'player_candidate';
        this.mode = 'onePlayer';
        delta[deltakey] = name;
        delta['mode'] = this.mode;
        break;
      case 'onePlayer':
        this.log.debug('second player added');
        this.players.push(name);
        delta = this.setPlayersOrder();
        $('join-button').hide();
        this.mode = 'playing';
        break;
    }
    //this.controlPanel.update(this.mode);
    this.log.debug('sending delta : ' + Log.dumpObject(delta));
    this.log.goOut();
    // 以下を呼べば、acceptStateに飛んでしまう
    wave.getState().submitDelta(delta);
  },
	/**
	 * setPlayersOrder()
	 */
        // 前提： 2人のプレイヤーがいる（this.players.length == 2)
        // 機能： 2つのPlayerオブジェクトを生成し、ランダムに2人のプレイヤーに割り当てる
        //        this.blackplayers, this.whiteplayersをセットする
        // 返値 : stateに載せる情報としてdeltaを作成し返す
  setPlayersOrder: function setPlayersOrder() { // GameController
    var delta = {};
    var viewer = wave.getViewer().getId();
    this.log.getInto('GameController#setPlayersOrder');
    
    if(Math.random() < 0.5){ 
      this.player1 = new Player('player1', this.players[0], this.players[0]==viewer);
      this.player2 = new Player('player2', this.players[1], this.players[1]==viewer);
    } else {
      this.player1 = new Player('player1', this.players[1], this.players[1]==viewer);
      this.player2 = new Player('player2', this.players[0], this.players[0]==viewer);
    }
    this.log.debug('player1 : ' + this.player1.toString());
    this.log.debug('player2 : ' + this.player2.toString());
    this.blackplayers.push(this.player1);
    delta['blacks'] = this.blackplayers.pluck('name').join(',');
    this.log.debug('blackplayers : ' + this.blackplayers.pluck('name').join('<br>'));
    this.whiteplayers.push(this.player2);
    delta['whites'] = this.whiteplayers.pluck('name').join(',');
    this.log.debug('whiteplayers : ' + this.whiteplayers.pluck('name').join('<br>'));
    delta['mode'] = 'playing';
    this.log.goOut();
    return delta;
  },
	/**
	 * createPlayer(bs, ws)
	 */
        // 前提： 複数人のプレイヤーがいて、先手bs, 後手psとして受け取る
        // 機能： 2つのPlayerオブジェクトを生成
        //        this.blackplayers, this.whiteplayersをセットする
        // 返値 : stateに載せる情報としてdeltaを作成し返す
  createPlayer: function createPlayer(bs, ws) { // GameController
    var delta = {};
    var viewer = wave.getViewer().getId();
    var b = bs.split(',')[0];
    var w = ws.split(',')[0];
    this.log.getInto('GameController#createPlayer');
    this.player1 = new Player('player1', b, b==viewer);
    this.player2 = new Player('player2', w, w==viewer);
    this.log.debug('player1 : ' + this.player1.toString());
    this.log.debug('player2 : ' + this.player2.toString());
    this.blackplayers.push(this.player1);
    delta['blacks'] = this.blackplayers.pluck('name').join(',');
    this.log.debug('blackplayers : ' + this.blackplayers.pluck('name').join('<br>'));
    this.whiteplayers.push(this.player2);
    delta['whites'] = this.whiteplayers.pluck('name').join(',');
    this.log.debug('whiteplayers : ' + this.whiteplayers.pluck('name').join('<br>'));
    delta['mode'] = 'playing';
    this.log.goOut();
    return delta;
  },
/*
    if (!this.player1) {
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
    //this.log.warn('game.show');
    //this.board.show();
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
  getTurn: function getTurn() { // GameController
    // turnは論理値。countが偶数ならtrueで先手番、奇数ならfalseで後手番。
    return (this.count % 2 == 0);
  },
	/**
	 * thisTurnPlayer()
	 */
  thisTurnPlayer: function thisTurnPlayer() { // GameController
    return this.getTurn() ? this.player1 : this.player2;
  },
	/**
	 * isViewersTurn()
	 */
  isViewersTurn: function isViewersTurn() { // GameController
    return this.thisTurnPlayer().isViewer;
  },
	/**
	 * finish(winner)
	 */
  finish: function finish(winner) { // GameController
    this.log.getInto();
    if (this.checkFinish(piece, toCell))
      this.message(winner.shortName() + t('win'));
    else
      this.sendDelta();
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
    if(wave){
      if(wave.getViewer()){
        this.viewer = wave.getViewer().getId();
      } else {
        this.log.fatal('wave.getViewer is null');
        alert('wave.getViewer is null');
      }
    } else {
      this.log.fatal('wave is null');
      alert('wave is null');
    }

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
    this.controlPanel.update('playing');
    this.mainRoutine();
    this.log.warn('leaving Game#fromState');
    this.log.goOut();
  },
	/**
	 * getPlayersFromState(state)
	 */
  getPlayersFromState: function getPlayersFromState(state) { // GameController
    var ps, p, bs, ws;
    this.log.getInto('GameController#getPlayersFromState');
    switch(this.mode){
      case 'onePlayer':
        if (ps = state.get('players')){
          this.log.debug('players : ' + ps);
          this.players = ps.split(',');
          this.log.debug('this.players : ' + this.players)
        } else {
          this.log.fatal('players not found in state');
        }
            break;
      case 'preparePlayers':
        if (ps = state.get('players')){
          this.log.debug('players : ' + ps);
          this.players = ps.split(',');
          this.log.debug('this.players : ' + this.players)
          if(!this.player1){
            this.setPlayersOrder();
            if(this.viewersTurn()) this.game.initialDraggable(this.viewersTurn());
          }
        } else {
          this.log.fatal('players not found in state');
        }
            break;
      case 'playing':
        bs = state.get('blacks');  ws = state.get('whites');
        if (bs && ws){
          this.log.debug('blacks : ' + bs + '<br>' + 'whites : ' + ws);
          if(!this.player1){
            this.createPlayer(bs, ws);
            if(this.viewersTurn()) this.game.initialDraggable(this.viewersTurn());
          }
        } else {
          this.log.fatal('blacks and whites are not found in state');
        }
            break;
      default:
    }
    this.log.goOut();
  },
	/**
	 * viewersTurn()
	 */
        // viewerが先手なら'black'を返し
        //         後手なら'white'を返す
        // viewerが先手でも後手でもなければfalseを返す
  viewersTurn: function viewersTurn(){ // GameController
    this.log.getInto('GameController#viewersTurn');
    var ret = false;
    var viewer = wave.getViewer().getId();
    switch(viewer){
      case this.player1.name:
        ret = 'black';
        break;
      case this.player2.name:
        ret = 'white';
        break;
      default:
        ret = false;
        break;
     } 
    this.log.goOut();
    return ret;
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
