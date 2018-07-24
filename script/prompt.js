window.onload = function() {

    //loaclStorageからのデータ読み込み
    documentText = window.localStorage.getItem("documentText") !== null ? window.localStorage.getItem("documentText") : "";
    timerMin = window.localStorage.getItem("timerMin") !== null ? window.localStorage.getItem("timerMin") : 2;
    timerSec = window.localStorage.getItem("timerSec") !== null ? window.localStorage.getItem("timerSec"): 0;
    spaceCount = window.localStorage.getItem("spaceCount") !== null ? window.localStorage.getItem("spaceCount"): 20;
    kanaAvailability = window.localStorage.getItem("kanaAvailability") !== null ? (window.localStorage.getItem("kanaAvailability") == "true" ? "checked" : ""): "checked";
    speedMultiple = window.localStorage.getItem("speedMultiple") !== null ? JSON.parse(window.localStorage.getItem("speedMultiple")) : [];

    //イベント
    document.getElementById("fullScreenButton").onclick = fullScreen;
    document.getElementById("startButton").onclick = start;
    document.getElementById("stopButton").onclick = stop;
    window.onresize = resize;

    //initialize
    canvas = document.createElement("canvas"); /* 課題：授業で扱わなかったHTML要素を自分で調べて使用している */
    document.getElementById("canvasSpace").appendChild(canvas);
    resize();

    setup();
};

var isTimerRunning = false; //タイマーが実行中か
var timer;  //タイマーの参照
var isFullScreen = false; //フルスクリーンかどうか
var canvas; //HTML5 Canvasへの参照
var canvasHeight; //Canvasの内部的な高さ（高解像度対応
var canvasWidth;　//Canvasの内部的な幅（高解像度対応
var documentText;　//localStorageから取得したテキストデータ
var timerMin; //制限時間（分）
var timerSec; //制限時間（秒）
var spaceCount; //空行を何文字分として扱うか
var kanaAvailability; //かなベース速度調整対応
var speedMultiple; //スピード調整値

var isEnd = false; //終了しているかどうか

var lines = []; //行毎の文字列の配列　/* 課題：配列を使用している */
var linePosX = []; //行ごとの位置（x）の配列
var linePosY = []; //行ごとの位置（y）の配列
var ctx; //コンテキストの参照
var lineSeparate = 100; //ライン間のスペース
var charSize = 150; //文字サイズ

var currentLine; //表示中の行
var currentChar; //表示中の文字
var unitProgress; //調整単位の進み具合
var unitPerSec; //秒あたりの調整単位の進む量
var unitPerFrame; //フレームあたりの調整単位の進む量
var unitProgressRelative; //文字幅に対するすすんだ調整単位の割合
var framePerSec = 50; //FPS

//フルスクリーン表示のトグル
var fullScreen = function() /* 課題：JavaScriptの関数を複数個定義している */
{
    /* 課題：if文を使用している */
    if(isFullScreen)
    {
        if ( document.webkitCancelFullScreen)
        {
            document.webkitCancelFullScreen();
            isFullScreen = false;
        }
        else if ( document.mozCancelFullScreen)
        {
            document.mozCancelFullScreen();
            isFullScreen = false;
        }
        else if ( document.msExitFullscreen)
        {
            document.msExitFullscreen();
            isFullScreen = false;
        }
        else if ( document.exitFullscreen)
        {
            document.exitFullscreen();
            isFullScreen = false;
        }

    }
    else
    {
        if ( document.getElementById("screen").webkitRequestFullScreen)
        {
            document.getElementById("screen").webkitRequestFullScreen();
            isFullScreen = true;
        }
        else if ( document.getElementById("screen").mozRequestFullScreen)
        {
            document.getElementById("screen").mozRequestFullScreen();
            isFullScreen = true;
        }
        else if ( document.getElementById("screen").msFullscreenEnabled)
        {
            document.getElementById("screen").msRequestFullscreen();
            isFullScreen = true;
        }
        else if ( document.getElementById("screen").fullscreenEnabled)
        {
            document.getElementById("screen").requestFullscreen();
            isFullScreen = true;
        }
    }
    





};

//初期化
var setup = function() {　/* 課題：JavaScriptの関数を複数個定義している */

    ctx = canvas.getContext('2d');
    ctx.fillStyle = "#F1ECE9";
    ctx.font = charSize + "px serif";

    lines = [];

    lines.push("");
    
    for(var i = 0; i < documentText.length; i++) /* 課題：while文またはfor文を使用している */ /* 課題：実行が進むにつれて値がだんだん増える（あるいは減る）ような変数を使用している */
    {
        var char = documentText.substr(i,1);
        if(char.match(/\r\n|\n|\r/) !== null) {
            if(documentText.substr(i-1,1).match(/\r\n|\n|\r/) !== null)
            {
                lines[lines.length - 1] += "　";
                lines.push("");
            }
            else
            {
                lines.push("");
            }
            
        }
        else {
            lines[lines.length - 1] += char;
        }
        if(ctx.measureText(lines[lines.length - 1]).width >= canvasWidth - 200 - 200)
        {
            lines.push("");
        }
    }


    currentLine = 0;
    currentChar = 0;
    unitProgress = 0;

    var unit = 0;
    for(var k = 0; k < speedMultiple.length; k++)
    {
        unit += speedMultiple[k];
    }
    var sec = parseInt(timerMin) * 60 + parseInt(timerSec);
    unitPerSec = unit / sec;
    unitPerFrame = unitPerSec / framePerSec;

    update();

};

//フレームアップデート
var update = function() {

    unitProgress += unitPerFrame;
    var charNum = 0;
    for(var l = 0; l < currentLine; l++)
    {
        charNum += lines[l].length;
    }
    var unit;
    unit = speedMultiple[charNum + currentChar];
    unitProgressRelative = unitProgress / unit;
    if(unitProgress >= unit)
    {
        currentChar += 1;
        unitProgress -= unit;
        unitProgressRelative = unitProgress / speedMultiple[charNum + currentChar];
    }


    if(currentChar >= lines[currentLine].length)
    {
        currentChar = 0;
        currentLine += 1;
    }
    if(currentLine >= lines.length)
    {
        stop();
        isEnd = true;
    }
    else {
        linePosX = [];
        linePosY = [];
        linePosX.push(200);
        linePosY.push(canvasHeight / 2 - (charSize + lineSeparate) * (currentLine +((currentChar + unitProgressRelative) / lines[currentLine].length)) + 200);
        for(var i = 1; i < lines.length; i++)
        {
            linePosX.push(200);
            linePosY.push(linePosY[i - 1] + charSize + lineSeparate);
        }
        draw();
    }
};

//下線の描画
var drawUnderline = function(x,y,width)　/* 課題：引数のある関数を定義している */
{
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x + width,y);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#ff0000';
    ctx.lineCap = 'round';
    ctx.stroke();
};

//描画
var draw = function() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    for(var i = 0; i < lines.length; i++)
    {
        ctx.fillText(lines[i], linePosX[i], linePosY[i]);
    }

    drawUnderline(200,linePosY[currentLine], ctx.measureText(lines[currentLine].substr(0,currentChar)).width +  ctx.measureText(lines[currentLine].substr(currentChar,1)).width * unitProgressRelative);
};

//タイマーのスタート
var start = function() {
    clearInterval(timer);
    if(isTimerRunning || isEnd)
    {
        setup();
    }
    timer = setInterval(update,1000/50);
    isTimerRunning = true;
};

//タイマーの停止
var stop = function() {
    clearInterval(timer);
    isTimerRunning = false;
};

//canvasリサイズ
var resize = function() {
    canvasHeight = document.getElementById("canvasSpace").clientHeight * 3;
    canvasWidth = document.getElementById("canvasSpace").clientWidth * 3;
    canvas.height = canvasHeight;
    canvas.width = canvasWidth;
    ctx = canvas.getContext('2d');
    ctx.fillStyle = "#F1ECE9";
    ctx.font = charSize + "px serif";
};