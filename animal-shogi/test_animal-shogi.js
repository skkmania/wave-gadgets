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
  testRed : function() {  with( this )  {
    // 領域を赤色にするテスト
    var color = 'red';
    // ボタンをクリック(そうでなければイベントハンドラを実行)
    try  {
      new Event.simulateMouse( color, 'click' );
    }  catch( e )  {
      buttonClick( { target : { id : color } } );
    }
    // 領域の背景色が'red'なら動作は正常
    assertEqual( color, $( 'demo' ).getStyle( 'backgroundColor' ) );
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


