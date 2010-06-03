/**
 * BoardWithDB
 */
BoardWithDB = Class.create(Board, {
	/**
	 * initialize(elm, game)
	 */
  initialize: function initialize($super, elm, game) {
    game.log.getInto('BoardWithDB#initialize');
    $super(elm, game);
    this.initialBid = 1;
    game.log.warn('Board#initialize going to process initialString.');
    $A(this.initialString).each(function(chr, idx){
      game.log.getInto('reading initialString');
      game.log.warn('idx: ' + idx);
      if(chr == '_'){ game.log.goOut(); return; }
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
    game.log.debug('leaving Board#initialize');
    game.log.goOut();
  },
	/**
	 * toDebugString()
	 */
  toDebugString: function toDebugString(){ // BoardWithDB
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
