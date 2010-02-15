var testcases = {
  setup : function()  {  with( this )  {
    // 領域を初期化
    // $( 'demo' ).setStyle( { 'backgroundColor' : '', 'color' : '', 'fontWeight' : '' } );
  } },
  teardown : function()  {  with( this )  {
    /* ..... テストの後処理(省略) ..... */
  } },
  testKanji : function() {  with( this )  {
    var num = 1;
    assertEqual( '一', num.toKanji() );
  } },
  testCellAfterMove : function() {  with( this )  {
    // Pieceのmoveのテスト
    var fromCell = game.board.cells[2][3];
    var toCell = game.board.cells[2][2];
    var storedPiece = fromCell.piece;
    try  {
      fromCell.piece.move(fromCell, toCell, false, false);
    }  catch( e )  {
      buttonClick( { target : { id : color } } );
    }
    // 駒が動いた後のセルの状態をテスト
    assertNull(fromCell.piece); 
    assertIdentical(storedPiece, toCell.piece);
  } },
  testGreen : function() {  with( this )  {
    /* ..... 領域を緑色にするテスト(省略) ..... */
    var color = 'green';
    try  {
      new Event.simulateMouse( color, 'click' );
    }  catch( e )  {
      buttonClick( { target : { id : color } } );
    }
    assertEqual( color, $( 'demo' ).getStyle( 'backgroundColor' ) );
  } }
};
//new Test.Unit.Runner( testcases, 'testlog' );


