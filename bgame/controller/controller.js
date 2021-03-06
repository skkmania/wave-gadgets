//GameConstructor = { 'shogi':ShogiGame, 'animalshogi':AnimalShogiGame };

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
    return (this.id == 'player1') == (window.gameController.top == 1);
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
    if (window.gameController.playerInTurn() == this) classNames += ' turn';
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
    this.counterElm = $('counterNum');
  },
	/**
	 * reverse()
	 */
  reverse: function reverse() { // ControlPanel              
     this.controller.log.getInto('ControlPanel#reverse');
      if (this.controller.top == 1){                                                
        this.player1Elm = $('top-panel');
        this.player2Elm = $('bottom-panel');
      } else {       
        this.player2Elm = $('top-panel');
        this.player1Elm = $('bottom-panel');
      }                    
    this.player1Elm.update(t('sente') + (this.controller.player1 ? this.controller.player1.statusHtml() : t('waiting')));
    this.player2Elm.update(t('gote') +  (this.controller.player2 ? this.controller.player2.statusHtml() : t('waiting')));
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
    this.counterElm.update(this.controller.count);
    if (!this.elm) this.elm = $('control-panel');                         
    if (this.controller.top == 1){                                                
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
      case 'over':
        this.controller.message(t('already_over') + '<br>' + wave.getState().get('winner') + t('win'));
        if(this.controller.player1)
          this.player1Elm.innerHTML = t('sente') + this.controller.player1.statusHtml();
        if(this.controller.player2)
          this.player2Elm.innerHTML = t('gote') + this.controller.player2.statusHtml();
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
    this.playerSetting = settings['playerSetting'] || 'viewer';
    if(settings === undefined){
      this.log.debug('settings is undefined.');
    } else {
      this.log.debug(this.settings);
    }

    this.game = new ShogiGame(settings, this);
    //this.game = new GameConstructor[settings['gameConstructor']](settings, this);
    this.players = $A([]);
    this.blackplayers = $A([]);
    this.whiteplayers = $A([]);
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
      this.mode = state.get('mode');
      this.log.debug('mode read from state is : ' + this.mode);
      if (this.mode){
        this[this.mode](state);
     } else {
        this.log.debug('there is no mode in state');
        this.mode = 'noPlayers';
        this.log.debug('so, this.mode is set to "noPlayers"');
        this.noPlayers();
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
    this.count = state.get('count') || 0;
    if(!this.player1) this.getPlayersFromState(state);
    this.determineTop();
    // topが決まったので持ち駒の位置も決められる。
    this.game.setStandPosition();
    $('join-button').hide();
    if (!this.game.board.shown) this.game.board.show();
    this.game.boardReadFromState(state);  // 盤面の読み込み
    this.game.toggleDraggable();
    this.controlPanel.update('playing');
    //this.prepareFromState(state);
    this.log.goOut();
  },
	/**
	 * over(state)
	 */
        // 勝負がついた後のstateChangeへのコールバック
        // これが呼ばれたときにはstateのmodeは'over'であり
        // stateのwinnerには勝者の名の文字列がある
  over: function over(state) {  // GameController
    this.log.getInto('GameController#over');
    this.count = state.get('count') || 0;
    if(!this.player1) this.getPlayersFromState(state);
    $('join-button').hide();
    if (!this.game.board.shown) this.game.board.show();
    this.game.boardReadFromState(state);  // 盤面の読み込み
    this.controlPanel.update('over');
      // draggableは消してしまい、ゲームを継続できなくする
    this.game.allPieces().pluck('drag').compact().invoke('destroy');
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
	 * makeDelta()
	 */
  makeDelta: function makeDelta(flag, winner){ // GameController
    this.log.getInto('GameController#makeDelta');
    this.count++;
    var delta = {};
    delta['board'] = this.game.board.toString();
    delta['bstand'] = this.game.blackStand.toString();
    delta['wstand'] = this.game.whiteStand.toString();
    delta['count'] = this.count.toString();
    switch(flag){
      case 'continue':
        break;
      case 'finish':
        delta['mode'] = 'over';
        delta['winner'] = winner.name;
        break;
      default:
        break;
    }
    this.log.goOut();
    return delta;
  },
	/**
	 * sendDelta()
	 */
  sendDelta: function sendDelta(delta){ // GameController
    this.log.getInto('GameController#sendDelta');
    // 送信
    this.log.warn('<div style="color:#FF0000">sending delta : </div>' + Log.dumpObject(delta));
    this.log.goOut();
    wave.getState().submitDelta(delta);
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
  playerInTurn: function playerInTurn() { // GameController
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
    this.nextTurn();
    this.log.goOut();
    return null;
  },
	/**
	 * receiveResult()
	 */
  receiveResult: function receiveResult() { // GameController
    this.log.getInto();
    if(this.checkFinish()){
      this.sendDelta();
    }
    this.log.goOut();
    return null;
  },
	/**
	 * receiveAction(actionContents)
	 */
  // ユーザのアクションがここに通知される
  //   (具体的には、gameのPieceがonDropの中でこの関数を呼び出す)
  // actionContents : [piece, fromObj, toCell]
  receiveAction: function receiveAction(actionContents) { // GameController
    this.log.getInto('GameController#receiveAction');
    switch(this.game.respondValidity(actionContents)){
      case 'needConfirm':
        this.confirmActionByUser(actionContents);
        break;
      case 'mustPromote':
        actionContents[0].promote();
        this.game.doAction(actionContents);
        break;
      case 'badAction':
        this.noticeBadActionToUser();
        break;
      default:
        this.game.doAction(actionContents);
        break;
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
    this.game.makeConfirmActionElement();
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
      break;
      case 'noElement':
        log.debug('noElement was clicked.');
      break;
    }
    window.gameController.game.doAction(actionContents);
    $('promoteOrNot').stopObserving();
    $('promoteOrNot').hide();
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
  determineTop: function determineTop() { // GameController
    this.log.getInto('GameController#determineTop');
     // 先手(player1)がbottomのとき0, top = 1 なら先手がtop
     // はじめからtop が１になるのはplayer2がviewerのときだけ
     // あとはviewerが反転ボタンで指定したとき
    if (this.top_by_viewer === 0 || this.top_by_viewer === 1){
       this.top = this.top_by_viewer;
       this.log.debug('top is set to ' + this.top + ' because top_by_viewer is ' + this.top_by_viewer);
    } else {
      this.top = 0;  // by default
      if (this.player2 && this.player2.isViewer){
        this.top = 1;
        this.log.debug('top is set to 1 because ' + this.player2.name + 'is viewer');
      }
    }
    this.log.debug('leaving determineTop with gameController.top : ' + this.top);
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
    if (this.mode) {
      switch (this.mode){
        case  'noPlayers':
          this.log.debug('first player added');
          this.players.push(name);
          this.message(t('waiting'));
          deltakey = 'players';
          this.mode = 'onePlayer';
          delta[deltakey] = name;
          delta['mode'] = this.mode;
          break;
        case 'onePlayer':
          this.log.debug('second player added');
          this.players.push(name);
          this.log.debug('players: ' + this.players.join(','));
          delta = this.setPlayersOrder();
          this.log.debug('returned delta : ' + Log.dumpObject(delta));
          $('join-button').hide();
          this.mode = 'playing';
          break;
      }
    } else {
        this.log.debug('first player added');
        this.players.push(name);
        this.message(t('waiting'));
        deltakey = 'players';
        this.mode = 'onePlayer';
        delta[deltakey] = name;
        delta['mode'] = this.mode;
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
    delta['players'] = this.players.join(',');
    this.blackplayers.push(this.player1);
    delta['blacks'] = this.blackplayers.pluck('name').join(',');
    this.log.debug('blackplayers : ' + this.blackplayers.pluck('name').join('<br>'));
    this.whiteplayers.push(this.player2);
    delta['whites'] = this.whiteplayers.pluck('name').join(',');
    this.log.debug('whiteplayers : ' + this.whiteplayers.pluck('name').join('<br>'));
    delta['mode'] = 'playing';
    this.log.debug('leaving with : ' + Log.dumpObject(delta));
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
    // Player オブジェクトを生成
    this.player1 = new Player('player1', b, b==viewer);
    this.player2 = new Player('player2', w, w==viewer);
    this.log.debug('player1 : ' + this.player1.toString());
    this.log.debug('player2 : ' + this.player2.toString());
    // blackplayers, whiteplayersの各配列におく
    this.blackplayers.push(this.player1);
    this.log.debug('blackplayers : ' + this.blackplayers.pluck('name').join('<br>'));
    this.whiteplayers.push(this.player2);
    this.log.debug('whiteplayers : ' + this.whiteplayers.pluck('name').join('<br>'));
    // state 用にdeltaに登録
    delta['blacks'] = this.blackplayers.pluck('name').join(',');
    delta['whites'] = this.whiteplayers.pluck('name').join(',');
    delta['mode'] = 'playing';
    // playersにも登録しておく（途中から受け取ったユーザのために）
    if (!this.players.include(b)) this.players.push(b);
    if (!this.players.include(w)) this.players.push(w);
    this.log.goOut();
    return delta;
  },
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
  },
	/**
	 * nextTurn()
	 */
  nextTurn: function nextTurn() { // GameController
    this.log.getInto('GameController#nextTurn');
    this.controlPanel.update('playing');
    this.clearMessage();
    this.log.goOut();
  },
	/**
	 * getTurn()
	 */
  getTurn: function getTurn() { // GameController
    // turnは論理値。countが偶数ならtrueで先手番、奇数ならfalseで後手番。
    this.log.getInto('GameController#getTurn');
    var ret = (this.count % 2 == 0);
    this.log.debug('count is ' + this.count + ', so returning with : ' + ret);
    this.log.goOut();
    return ret;
  },
	/**
	 * thisTurnPlayer()
	 */
  thisTurnPlayer: function thisTurnPlayer() { // GameController
    this.log.getInto('GameController#thisTurnPlayer');
    var ret = this.getTurn() ? this.player1 : this.player2;
    this.log.debug('returning with : ' + ret);
    this.log.goOut();
    return ret;
  },
	/**
	 * isViewersTurn()
	 */
        // 現在、viewerのturnならtrueを返す
  isViewersTurn: function isViewersTurn() { // GameController
    this.log.getInto('GameController#isViewersTurn');
    var ret = this.thisTurnPlayer().isViewer;
    this.log.debug('returning with : ' + ret);
    this.log.goOut();
    return ret;
  },
	/**
	 * reportActEnds(player, movingPieceType,moveTo, capturedPieceType)
	 */
  reportActEnds: function reportActEnds(player, movingPieceType, moveTo, capturedPieceType) { // GameController
    var winner = null;
    this.log.getInto('GameController#reportActEnds');
    this.log.debug('player: ' + player.name);
    this.log.debug('movingPieceType: ' + movingPieceType);
    this.log.debug('moveTo: ' + moveTo.inspect());
    this.log.debug('capturedPieceType: ' + capturedPieceType);
    if (winner = this.game.checkFinish(player, movingPieceType, moveTo, capturedPieceType))
      this.finish(winner);
    else
      this.sendDelta(this.makeDelta('continue'));
    this.log.goOut();
  },
	/**
	 * finish()
	 */
  finish: function finish(winner) { // GameController
    this.log.getInto('GameController#finish');
    this.message(winner.shortName() + t('win'));
    this.sendDelta(this.makeDelta('finish', winner));
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
	 * prepareFromState(state)
	 */
  prepareFromState: function prepareFromState(state) { // GameController
    this.log.getInto('GameController#prepareFromState');
    this.controlPanel.update('playing');
    this.mainRoutine();
    this.log.warn('leaving Game#prepareFromState');
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
            if(this.isViewersTurn()) this.game.initialDraggable(this.viewersTurn());
          }
        } else {
          this.log.fatal('players not found in state');
        }
            break;
      case 'playing':
      case 'over':
        bs = state.get('blacks');  ws = state.get('whites');
        if (bs && ws){
          this.log.debug('blacks : ' + bs + ',  ' + 'whites : ' + ws);
          if(!this.player1){
            this.createPlayer(bs, ws);
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
    this.log.debug('returning : ' + ret);
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
//    obj['playingViewer'] = (this.playingViewer ? this.playingViewer.toDebugString():null);
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
