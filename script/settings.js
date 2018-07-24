window.onload = function() {
    //イベントハンドラ
    document.getElementById("applyButton").onclick = applySettings;

    //localStorageのデータ読み込み
    /* 課題：innerHTMLまたはinput要素のvalueに代入することでウェブページの表示を変更している */
    document.getElementById("documentText").value = window.localStorage.getItem("documentText") !== null ? window.localStorage.getItem("documentText") : "";
    document.getElementById("timerMin").value = window.localStorage.getItem("timerMin") !== null ? window.localStorage.getItem("timerMin") : 2;
    document.getElementById("timerSec").value = window.localStorage.getItem("timerSec") !== null ? window.localStorage.getItem("timerSec"): 0;
    document.getElementById("spaceCount").value = window.localStorage.getItem("spaceCount") !== null ? window.localStorage.getItem("spaceCount"): 20;
    document.getElementById("kanaAvailability").checked = window.localStorage.getItem("kanaAvailability") !== null ? (window.localStorage.getItem("kanaAvailability") == "true" ? "checked" : ""): "checked";
};

//設定を保存するボタン
var applySettings = function applySettings()
{

    if(document.getElementById("kanaAvailability").checked)
    {
        var url = "cross_domain.php";
        var req = new XMLHttpRequest(); /* 課題：授業で扱わなかったJavaScriptの機能を自分で調べて使用している */
        req.open("POST", url);
        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        req.send("sentence=" + encodeURIComponent(String(document.getElementById("documentText").value)).replace( /%20/g, '+' ));

        req.onreadystatechange = function() {
            if (req.readyState == 4 && req.status == 200) {
                var speedMultiple = speedMultipleCalc(req.responseText);
                window.localStorage.setItem("speedMultiple",JSON.stringify(speedMultiple));
                window.localStorage.setItem("documentText",String(document.getElementById("documentText").value));
                window.localStorage.setItem("timerMin",document.getElementById("timerMin").value);
                window.localStorage.setItem("timerSec",document.getElementById("timerSec").value);
                window.localStorage.setItem("spaceCount",document.getElementById("spaceCount").value);
                window.localStorage.setItem("kanaAvailability",document.getElementById("kanaAvailability").checked);
                location.href = 'index.html';
            }
        };
    }
    else
    {
        var text = String(document.getElementById("documentText").value);
        var speedMultiple = [];
        for(var i = 0; i < text.length; i++)
        {
            var char = text.substr(i,1);
            if (char.match(/\r\n|\n|\r/) !== null )
            {
                if(i !== 0 && text.substr(i - 1,1).match(/\r\n|\n|\r/) !== null)
                {
                    speedMultiple.push(parseInt(document.getElementById("spaceCount").value));
                }
            }
            else {
                speedMultiple.push(1);
            }

        }
        window.localStorage.setItem("speedMultiple",JSON.stringify(speedMultiple));
        window.localStorage.setItem("documentText",String(document.getElementById("documentText").value));
        window.localStorage.setItem("timerMin",document.getElementById("timerMin").value);
        window.localStorage.setItem("timerSec",document.getElementById("timerSec").value);
        window.localStorage.setItem("spaceCount",document.getElementById("spaceCount").value);
        window.localStorage.setItem("kanaAvailability",document.getElementById("kanaAvailability").checked);
        location.href = 'index.html';
        
    }
    


};

//文字ごとのスピード調整量計算
var speedMultipleCalc = function speedMultipleCalc(text)
{
    var speedMultiple = [];

            var parser = new DOMParser();
            var responseDoc = parser.parseFromString(text,"text/xml");
            var words = responseDoc.getElementsByTagName("Word");

            for(var i = 0; i < words.length; i++)
            {
                if (words[i].getElementsByTagName("SubWordList").length !== 0)
                {
                    for(var j = 0; j < words[i].getElementsByTagName("SubWordList")[0].getElementsByTagName("SubWord").length; j++)
                    {
                        var subWord = words[i].getElementsByTagName("SubWordList")[0].getElementsByTagName("SubWord")[j];
                        var charCount2 = 0;
                        if(subWord.getElementsByTagName("Surface").length >= 1)
                        {
                            charCount2 = subWord.getElementsByTagName("Surface")[0].innerHTML.length;
                        }
                        var rubyCount2 = 0;
                        if(subWord.getElementsByTagName("Furigana").length >= 1)
                        {
                            rubyCount2 = subWord.getElementsByTagName("Furigana")[0].innerHTML.length;
                        }

                        if(rubyCount2 === 0)
                        {
                            for(var k = 0; k < charCount2; k++)
                            {
                                speedMultiple.push(1);
                            }
                        }
                        else{
                            for(var l = 0; l < charCount2; l++)
                            {
                                speedMultiple.push(rubyCount2/charCount2);
                            }
                        }
                    }
                }
                else if(words[i].getElementsByTagName("Surface")[0].innerHTML.match(/\r\n|\n|\r/) !== null)
                {
                    if(i !== 0 && words[i - 1].getElementsByTagName("Surface")[0].innerHTML.match(/\r\n|\n|\r/))
                    {
                        speedMultiple.push(parseInt(document.getElementById("spaceCount").value));
                    }
                }
                else if(words[i].getElementsByTagName("Surface")[0].innerHTML.match(/( |　)+/) !== null)
                {
                    speedMultiple.push(1);
                }
                else {
                    var charCount = 0;
                    if(words[i].getElementsByTagName("Surface").length >= 1)
                    {
                        charCount = words[i].getElementsByTagName("Surface")[0].innerHTML.length;
                    }
                    var rubyCount = 0;
                    if(words[i].getElementsByTagName("Furigana").length >= 1)
                    {
                        rubyCount = words[i].getElementsByTagName("Furigana")[0].innerHTML.length;
                    }

                    if(rubyCount === 0)
                    {
                        for(var m = 0; m < charCount; m++)
                        {
                            speedMultiple.push(1);
                        }
                    }
                    else{
                        for(var n = 0; n < charCount; n++)
                        {
                            speedMultiple.push(rubyCount/charCount);
                        }
                    }
                }
            }
            return speedMultiple;
};